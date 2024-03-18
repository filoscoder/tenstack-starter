import jwtStrategy, { StrategyOptions } from "passport-jwt";
import { Token } from "@prisma/client";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JwtService } from "../../services/jwt.service";
import CONFIG from "@/config";
import { CustomError, ERR } from "@/middlewares/errorHandler";
import { TokenDAO } from "@/db/token";
import { JWTPayload, TokenPair, TokenResult } from "@/types/response/jwt";
import { PlayersDAO } from "@/db/players";

export class AuthServices extends JwtService {
  private get cypherPass(): string {
    const secret = CONFIG.APP.CYPHER_PASS;
    if (!secret) {
      throw new CustomError({
        status: 500,
        code: "variables_entorno",
        description: "No se encontró CYPHER_PASS en .env",
      });
    }
    return secret;
  }

  /**
   * Generate access/refresh pair and link them to DB object
   * @param sub User ID
   * @param role User role
   */
  async tokens(sub: number, user_agent?: string): Promise<TokenResult> {
    const dbToken = await TokenDAO.create({ player_id: sub, user_agent });
    return {
      tokens: this.generateTokenPair(sub, dbToken.id, this.cypherPass),
      jti: dbToken.id,
    };
  }

  /**
   * Generate new pair from refresh token
   */
  async refresh(refresh: string, user_agent?: string): Promise<TokenPair> {
    if (!this.verifyTokenExpiration(refresh))
      throw new CustomError(ERR.TOKEN_EXPIRED);

    const payload = this.decodePayload(refresh);
    if (payload.type !== "refresh") throw new CustomError(ERR.TOKEN_INVALID);

    let token = await TokenDAO.getById(payload.jti);
    if (!token) throw new CustomError(ERR.TOKEN_INVALID);

    if (token.user_agent != user_agent)
      token = await this.invalidateTokenById(token.id);

    if (token.invalid) {
      await this.invalidateChildren(token);
      // TODO
      // notify("Uso duplicado de refresh token");
      throw new CustomError(ERR.TOKEN_INVALID);
    }

    const { tokens, jti } = await this.tokens(payload.sub, user_agent);
    // Invalidate received token and link it to newly created one.
    await TokenDAO.updateById(token.id, { invalid: true, next: jti });
    return tokens;
  }

  /**
   * Configure the JWT strategy for passport
   * @returns Strategy
   */
  jwtStrategy() {
    const options: StrategyOptions = {
      secretOrKey: this.cypherPass,
      jwtFromRequest: jwtStrategy.ExtractJwt.fromAuthHeaderAsBearerToken(),
      passReqToCallback: true,
    };

    const deserialize: jwtStrategy.VerifyCallbackWithRequest = async (
      request: Req,
      payload: JWTPayload,
      done: jwtStrategy.VerifiedCallback,
    ) => {
      const token = await TokenDAO.getById(payload.jti);
      if (
        !token ||
        token.invalid ||
        payload.type !== "access" ||
        token.user_agent != request.headers["user-agent"]
      )
        return done(new CustomError(ERR.TOKEN_INVALID), false);

      const user = await PlayersDAO._getById(payload.sub);
      return done(null, user);
    };

    return new jwtStrategy.Strategy(options, deserialize);
  }

  private invalidateTokenById(token_id: string) {
    return TokenDAO.updateById(token_id, { invalid: true });
  }

  invalidateTokensByUserAgent(player_id: number, user_agent?: string) {
    return TokenDAO.update({ player_id, user_agent }, { invalid: true });
  }

  /**
   * Invalidate given token and all its children
   */
  private async invalidateChildren(token: Token) {
    await this.invalidateTokenById(token.id);
    while (token!.next) {
      token = await this.invalidateTokenById(token.next);
    }
  }

  async logout(user_id: number, encoded: string) {
    try {
      const payload = jwt.verify(encoded, this.cypherPass) as JwtPayload;
      if (payload === undefined) return;
      const token = await TokenDAO.authorizeRevocation(
        user_id,
        payload.jti as string,
      );
      await this.invalidateChildren(token);
    } catch (error: any) {
      if (error.name && error.name === "TokenExpiredError") return;
      throw error;
    }
  }
}

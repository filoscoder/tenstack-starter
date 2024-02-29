import jwtStrategy, { StrategyOptionsWithoutRequest } from "passport-jwt";
import { JwtService } from "../../services/jwt.service";
import CONFIG from "@/config";
import { UnauthorizedError } from "@/helpers/error";
import { CustomError, ERR } from "@/middlewares/errorHandler";
import { TokenDAO } from "@/db/token";
import { notify } from "@/helpers/notification";
import { JWTPayload, TokenPair, TokenResult } from "@/types/response/jwt";
import { PlayersDAO } from "@/db/players";

export class AuthService extends JwtService {
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
  async tokens(sub: number, role: string): Promise<TokenResult> {
    const dbToken = await TokenDAO.create(sub);
    return {
      tokens: this.generateTokenPair(sub, role, dbToken.id, this.cypherPass),
      id: dbToken.id,
    };
  }

  /**
   * Generate new pair from refresh token
   */
  async refresh(refresh: string): Promise<TokenPair> {
    if (!this.verifyTokenExpiration(refresh))
      throw new CustomError(ERR.TOKEN_EXPIRED);

    const payload = this.decodePayload(refresh);
    if (payload.type !== "refresh") throw new CustomError(ERR.TOKEN_INVALID);

    let token = await TokenDAO.getById(payload.jti);
    if (!token) throw new CustomError(ERR.TOKEN_INVALID);

    if (token.invalid) {
      while (token!.next) {
        token = await TokenDAO.update(token!.next, { invalid: true });
      }
      notify("Uso duplicado de refresh token");
      throw new CustomError(ERR.TOKEN_INVALID);
    }
    // If it was not used:
    const { tokens, id } = await this.tokens(payload.sub, payload.role);
    // Invalidate received token and link it to newly created one.
    await TokenDAO.update(token.id, { invalid: true, next: id });
    return tokens;
  }

  /**
   * Configure the JWT strategy for passport
   * @returns Strategy
   */
  jwtStrategy() {
    const options: StrategyOptionsWithoutRequest = {
      secretOrKey: this.cypherPass,
      jwtFromRequest: jwtStrategy.ExtractJwt.fromAuthHeaderAsBearerToken(),
    };

    const deserialize: jwtStrategy.VerifyCallback = async (
      payload: JWTPayload,
      done: jwtStrategy.VerifiedCallback,
    ) => {
      // Check token validity
      const token = await TokenDAO.getById(payload.jti);
      if (!token || token.invalid || payload.type !== "access")
        return done(new CustomError(ERR.TOKEN_INVALID), false);

      if (payload.role === CONFIG.ROLES.AGENT)
        return done(null, { username: "agent", role: payload.role });

      if (payload.role === CONFIG.ROLES.PLAYER) {
        const player = await PlayersDAO._getById(payload.sub);
        return done(null, { ...player, role: payload.role });
      } else return done(new UnauthorizedError("No autenticado"));
    };

    return new jwtStrategy.Strategy(options, deserialize);
  }
}

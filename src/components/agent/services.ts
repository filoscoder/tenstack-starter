import jwt from "jsonwebtoken";
import jwtStrategy, { StrategyOptionsWithoutRequest } from "passport-jwt";
import { Deposit, Payment } from "@prisma/client";
import CONFIG from "@/config";
import { CustomError } from "@/middlewares/errorHandler";
import { Credentials } from "@/types/request/players";
import { decrypt, hash } from "@/utils/crypt";
import { PaymentsDAO } from "@/db/payments";
import { DepositsDAO } from "@/db/deposits";
import { UnauthorizedError } from "@/helpers/error";

export class AgentServices {
  private static get username(): string {
    const encryptedUsername = CONFIG.AUTH.AGENT_FRONT_USERNAME;
    if (!encryptedUsername) {
      throw new CustomError({
        status: 500,
        code: "variables_entorno",
        description: "No se encontró el username de agente en .env",
      });
    }
    return decrypt(encryptedUsername);
  }

  private static get cypherPass(): string {
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

  static async login(credentials: Credentials): Promise<string> {
    const { username, password } = credentials;
    const hashedPass = await hash(password);
    if (
      username !== this.username ||
      hashedPass !== CONFIG.AUTH.AGENT_FRONT_PASSWORD
    ) {
      throw new CustomError({
        status: 401,
        code: "credenciales_invalidas",
        description: "Usuario o contraseña incorrectos",
      });
    }
    const token = jwt.sign(
      // Payload
      { sub: "agent", iss: "casino-mex_agent_panel" },
      // Secret
      this.cypherPass,
      // Options
      { expiresIn: "12h" },
    );
    return token;
  }

  static async showPayments(): Promise<Payment[] | null> {
    const payments = PaymentsDAO.index();
    return payments;
  }

  /**
   * Mark a pending payment as paid
   */
  static async markAsPaid(payment_id: number): Promise<Payment> {
    const payment = PaymentsDAO.update(payment_id, {
      paid: new Date().toISOString(),
    });
    return payment;
  }

  static async showDeposits(): Promise<Deposit[] | null> {
    const deposits = DepositsDAO.index();
    return deposits;
  }

  /**
   * Configure the JWT strategy for passport
   * @returns Strategy
   */
  static jwtStrategy() {
    const options: StrategyOptionsWithoutRequest = {
      secretOrKey: this.cypherPass,
      jwtFromRequest: jwtStrategy.ExtractJwt.fromAuthHeaderAsBearerToken(),
      issuer: "casino-mex_agent_panel",
    };

    return new jwtStrategy.Strategy(options, (payload, done) => {
      if (payload.sub === "agent") return done(null, "agent");
      else return done(new UnauthorizedError("No autenticado"));
    });
  }
}

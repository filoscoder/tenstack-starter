import { Deposit, Payment } from "@prisma/client";
import { AuthService } from "../auth/services";
import CONFIG from "@/config";
import { CustomError } from "@/middlewares/errorHandler";
import { Credentials } from "@/types/request/players";
import { decrypt, hash } from "@/utils/crypt";
import { PaymentsDAO } from "@/db/payments";
import { DepositsDAO } from "@/db/deposits";
import { AgentBankAccount } from "@/types/response/agent";
import { UserRootDAO } from "@/db/user-root";
import { TokenService } from "@/services/token.service";
import { TokenPair } from "@/types/response/jwt";

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

  static async login(credentials: Credentials): Promise<TokenPair> {
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
    const authService = new AuthService();
    const { tokens } = await authService.tokens(1, CONFIG.ROLES.AGENT);
    return tokens;
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

  static async getBankAccount(): Promise<AgentBankAccount> {
    const account = UserRootDAO.getBankAccount();
    return account;
  }

  static async updateBankAccount(
    data: AgentBankAccount,
  ): Promise<AgentBankAccount> {
    const tokenService = new TokenService();
    const agent = await UserRootDAO.update(tokenService.username, {
      bankAccount: data,
    });
    return agent.bankAccount as AgentBankAccount;
  }
}

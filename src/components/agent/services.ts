import { Deposit, Payment } from "@prisma/client";
import { FinanceServices } from "../transactions/services";
import { AuthServices } from "../auth/services";
import CONFIG from "@/config";
import { CustomError, ERR } from "@/middlewares/errorHandler";
import { Credentials } from "@/types/request/players";
import { compare, decrypt } from "@/utils/crypt";
import { PaymentsDAO } from "@/db/payments";
import { DepositsDAO } from "@/db/deposits";
import { AgentBankAccount, BalanceResponse } from "@/types/response/agent";
import { UserRootDAO } from "@/db/user-root";
import { TokenService } from "@/services/token.service";
import { TokenPair } from "@/types/response/jwt";
import { HttpService } from "@/services/http.service";
import { hidePassword } from "@/utils/auth";

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
  private static get password(): string {
    if (!CONFIG.AUTH.AGENT_FRONT_PASSWORD)
      throw new CustomError(ERR.AGENT_PASS_NOT_SET);

    return CONFIG.AUTH.AGENT_FRONT_PASSWORD;
  }

  static async login(
    credentials: Credentials,
    userAgent?: string,
  ): Promise<TokenPair> {
    const { username, password } = credentials;
    const passwordCheck = await compare(password, this.password);
    if (username !== this.username || !passwordCheck) {
      throw new CustomError({
        status: 401,
        code: "credenciales_invalidas",
        description: "Usuario o contraseña incorrectos",
      });
    }
    const authServices = new AuthServices();
    const { tokens } = await authServices.tokens(
      1,
      CONFIG.ROLES.AGENT,
      userAgent,
    );
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

  static async getBalance(): Promise<BalanceResponse> {
    const url = "accounts/user";
    const httpService = new HttpService();
    const response = await httpService.authedAgentApi.get(url);
    if (response.status !== 200)
      throw new CustomError({
        code: "error_balance",
        status: response.status,
        description: "Error en el panel al obtener el balance",
      });
    return {
      balance: Number(response.data.balance),
      currency: response.data.balance_currency,
    };
  }

  static async completePendingDeposits(): Promise<Deposit[]> {
    const deposits = await DepositsDAO.getPendingCoinTransfers();
    for (const deposit of deposits) {
      const financeServices = new FinanceServices(
        "deposit",
        deposit.amount,
        deposit.currency,
        deposit.Player.panel_id,
      );
      const result = await financeServices.transfer(deposit.id);
      if (result.status === "COMPLETED") deposit.coins_transfered = new Date();
      deposit.Player = hidePassword(deposit.Player);
      console.log("DEPOSIT", deposit);
      console.log("RESULT", result);
    }

    return deposits;
  }
}

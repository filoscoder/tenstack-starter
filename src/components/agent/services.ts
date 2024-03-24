import { Deposit, Payment } from "@prisma/client";
import { FinanceServices } from "../transactions/services";
import { AuthServices } from "../auth/services";
import { CustomError } from "@/middlewares/errorHandler";
import { Credentials } from "@/types/request/players";
import { compare } from "@/utils/crypt";
import { PaymentsDAO } from "@/db/payments";
import { DepositsDAO } from "@/db/deposits";
import { AgentBankAccount, BalanceResponse } from "@/types/response/agent";
import { UserRootDAO } from "@/db/user-root";
import { TokenPair } from "@/types/response/jwt";
import { HttpService } from "@/services/http.service";
import { hidePassword } from "@/utils/auth";
import { NotFoundException, UnauthorizedError } from "@/helpers/error";
import { PlayersDAO } from "@/db/players";
import CONFIG from "@/config";
import { ERR } from "@/config/errors";

export class AgentServices {
  static async login(
    credentials: Credentials,
    user_agent?: string,
  ): Promise<TokenPair> {
    const { username, password } = credentials;
    const agent = await PlayersDAO.getByUsername(username);
    if (!agent) throw new NotFoundException();

    if (!agent.roles.some((r) => r.name === CONFIG.ROLES.AGENT))
      throw new UnauthorizedError("Solo agentes");

    const passwordCheck = await compare(password, agent?.password);
    if (username !== agent.username || !passwordCheck)
      throw new CustomError(ERR.INVALID_CREDENTIALS);

    const authServices = new AuthServices();
    authServices.invalidateTokensByUserAgent(agent.id, user_agent);
    const { tokens } = await authServices.tokens(agent.id, user_agent);
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
    const agent = await UserRootDAO.update({
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
    const financeServices = new FinanceServices();
    for (const deposit of deposits) {
      const result = await financeServices.transfer(
        "deposit",
        deposit,
        deposit.Player.panel_id,
      );
      if (result.status === CONFIG.SD.COIN_TRANSFER_STATUS.COMPLETED)
        deposit.coins_transfered = new Date();
      deposit.Player = hidePassword(deposit.Player);
    }

    return deposits;
  }
}

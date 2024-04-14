import { Deposit, Payment } from "@prisma/client";
import { AxiosResponse } from "axios";
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
import { NotFoundException, UnauthorizedError } from "@/helpers/error";
import { PlayersDAO } from "@/db/players";
import CONFIG from "@/config";
import { ERR } from "@/config/errors";
import { BotFlowsDAO } from "@/db/bot-flows";
import { AlqCuentaAhorroResponse } from "@/types/response/alquimia";

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
  static async markAsPaid(payment_id: string): Promise<Payment> {
    const payment = PaymentsDAO.update(payment_id, {
      paid: new Date().toISOString(),
    });
    return payment;
  }

  static async showDeposits(depositId?: string): Promise<Deposit[] | null> {
    if (depositId) {
      const deposit = await DepositsDAO.getById(depositId);
      if (!deposit) return null;
      return [deposit];
    }
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

  static async getCasinoBalance(): Promise<BalanceResponse> {
    const url = "accounts/user";
    const httpService = new HttpService();
    const response: AxiosResponse = await httpService.authedAgentApi.get(url);
    if (response.status !== 200)
      throw new CustomError({
        code: "agent_api_error",
        status: response.status,
        description: "Error en el panel al obtener el balance",
        detail: response.data,
      });
    return {
      balance: Number(response.data.balance),
    };
  }

  static async getAlqBalance(): Promise<BalanceResponse> {
    const url = "cuenta-ahorro-cliente";
    const httpService = new HttpService();
    const response: AxiosResponse = await httpService.authedAlqApi.get(url);
    if (response.status !== 200)
      throw new CustomError({
        code: "alquimia",
        status: response.status,
        description: "Error en alquimia al obtener el balance",
        detail: response.data,
      });
    const account = (response.data as AlqCuentaAhorroResponse).find(
      (account) =>
        account.id_cuenta_ahorro === CONFIG.EXTERNAL.ALQ_SAVINGS_ACCOUNT_ID,
    );
    if (!account) throw new CustomError(ERR.ALQ_ACCOUNT_NOT_FOUND);
    return {
      balance: Number(account.saldo_ahorro),
    };
  }

  static async freePendingCoinTransfers(): Promise<Deposit[]> {
    const deposits = await DepositsDAO.getPendingCoinTransfers();
    const response: Deposit[] = [];
    const financeServices = new FinanceServices();
    for (const deposit of deposits) {
      if (deposit.status !== CONFIG.SD.DEPOSIT_STATUS.VERIFIED) continue;
      const result = await financeServices.confirmDeposit(
        deposit.Player,
        deposit.id,
        { tracking_number: deposit.tracking_number },
      );
      response.push(result.deposit);
    }

    return response;
  }

  static async setOnCallBotFlow(active: boolean): Promise<void> {
    await BotFlowsDAO.setOnCall(active);
  }

  static async getOnCallStatus(): Promise<boolean> {
    const botFlow = await BotFlowsDAO.findOnCallFlow();

    return !!botFlow;
  }
}

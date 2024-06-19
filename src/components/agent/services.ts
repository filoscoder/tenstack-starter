import { Deposit, Payment } from "@prisma/client";
import { AxiosResponse } from "axios";
import { AuthServices } from "../auth/services";
import { DepositServices } from "../deposits/services";
import { Credentials } from "@/types/request/players";
import { compare } from "@/utils/crypt";
import { PaymentsDAO } from "@/db/payments";
import { DepositsDAO } from "@/db/deposits";
import {
  AgentBankAccount,
  BalanceResponse,
  SupportResponse,
} from "@/types/response/agent";
import { UserRootDAO } from "@/db/user-root";
import { TokenPair } from "@/types/response/jwt";
import { HttpService } from "@/services/http.service";
import { NotFoundException, UnauthorizedError } from "@/helpers/error";
import { PlayersDAO } from "@/db/players";
import CONFIG from "@/config";
import { ERR } from "@/config/errors";
import { BotFlowsDAO } from "@/db/bot-flows";
import {
  AlqCuentaAhorroResponse,
  AlqStatusTx,
} from "@/types/response/alquimia";
import { CustomError } from "@/helpers/error/CustomError";
import { UserRootUpdatableProps } from "@/types/request/agent";
import { AlquimiaTransferService } from "@/services/alquimia-transfer.service";

export class AgentServices {
  static async login(
    credentials: Credentials,
  ): Promise<{ tokens: TokenPair; fingerprintCookie: string }> {
    const { username, password } = credentials;
    const agent = await PlayersDAO.getByUsername(username);
    if (!agent) throw new NotFoundException();

    if (!agent.roles.some((r) => r.name === CONFIG.ROLES.AGENT))
      throw new UnauthorizedError("Solo agentes");

    const passwordCheck = await compare(password, agent?.password);
    if (username !== agent.username || !passwordCheck)
      throw new CustomError(ERR.INVALID_CREDENTIALS);

    const authServices = new AuthServices();
    const { tokens, fingerprintCookie } = await authServices.tokens(agent.id);
    return { tokens, fingerprintCookie };
  }

  /**
   * Release requested payment into player's bank account
   */
  static async releasePayment(payment_id: string): Promise<Payment> {
    const payment = await PaymentsDAO.authorizeRelease(payment_id);
    try {
      const alquimiaTransferService = new AlquimiaTransferService(payment);
      const transferStatus: AlqStatusTx = await alquimiaTransferService.pay();

      const updated = await PaymentsDAO.update(payment_id, {
        status: transferStatus.estatus,
        dirty: false,
        alquimia_id: Number(transferStatus.id_transaccion),
      });

      return updated;
    } catch (e) {
      await PaymentsDAO.update(payment_id, { dirty: false });
      throw e;
    }
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
    const depositServices = new DepositServices();
    for (const deposit of deposits) {
      if (deposit.status !== CONFIG.SD.DEPOSIT_STATUS.VERIFIED) continue;
      const result = await depositServices.confirm(deposit.Player, deposit.id, {
        tracking_number: deposit.tracking_number,
      });
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

  static async getSupportNumbers(): Promise<SupportResponse> {
    const agent = await UserRootDAO.getAgent();

    if (!agent) throw new CustomError(ERR.AGENT_UNSET);

    return {
      bot_phone: agent.bot_phone,
      human_phone: agent.human_phone,
    };
  }

  static async updateSupportNumbers(
    data: UserRootUpdatableProps,
  ): Promise<SupportResponse> {
    const agent = await UserRootDAO.update(data);

    return {
      bot_phone: agent.bot_phone,
      human_phone: agent.human_phone,
    };
  }
}

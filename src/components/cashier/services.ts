import { Cashier, CoinTransfer, Player } from "@prisma/client";
import { CoinTransferServices } from "../coin-transfers/services";
import CONFIG, { COIN_TRANSFER_STATUS } from "@/config";
import { CashierDAO } from "@/db/cashier";
import { PlayersDAO } from "@/db/players";
import { OrderBy, PlayerRequest } from "@/types/request/players";
import { HttpService } from "@/services/http.service";
import { AgentApiError } from "@/helpers/error/AgentApiError";
import { generateRandomPassword } from "@/utils/auth";
import { encrypt } from "@/utils/crypt";
import { prisma } from "@/prisma";
import { ERR } from "@/config/errors";
import { CustomError } from "@/helpers/error/CustomError";
import {
  CashierUpdateRequest,
  GeneralReportRequest,
} from "@/types/request/cashier";
import { NotFoundException } from "@/helpers/error";
import { ComissionResponse, GeneralReport } from "@/types/response/cashier";
import { FullUser, PlayerWithUsageMetrics } from "@/types/response/players";
import { useTransaction } from "@/helpers/useTransaction";

export class CashierServices {
  async create(playerRequest: PlayerRequest): Promise<Cashier> {
    const commission = CONFIG.SUBAGENT.PAYMENT_PERCENTAGE;
    const username = `agent_${playerRequest.username}`;
    const plainTextPassword = await generateRandomPassword();
    const encryptedPassword = encrypt(plainTextPassword);

    await this.createSubAgent(username, plainTextPassword, commission);

    return await CashierDAO.create({
      data: {
        username,
        password: encryptedPassword,
        handle: playerRequest.handle || `@${username}`,
      },
    });
  }

  private async createSubAgent(
    username: string,
    password: string,
    commission: number,
  ) {
    const url = "/pyramid/create/agent/";
    const agent = await prisma.player.findAgent();
    const httpService = new HttpService(agent);
    const data = {
      username,
      password,
      agent_info: {
        payments_percentage: commission * 100,
      },
    };

    const response = await httpService.authedAgentApi.post<any>(url, data);

    if (response.status !== 200 && response.status !== 400)
      throw new AgentApiError(
        response.status,
        "Error en el panel al crear el usuario",
        response.data,
      );
    if (
      response.status === 400 &&
      (response.data.code === "already_exists" ||
        response.data.code === "user_already_exists")
    )
      throw new CustomError(ERR.USER_ALREADY_EXISTS);
  }

  async listPlayers(
    page: number,
    itemsPerPage: number,
    cashierId: string,
    search?: string,
    orderBy?: OrderBy<Player>,
  ): Promise<PlayerWithUsageMetrics[]> {
    const query = PlayersDAO.filteredPlayersWithUsageMetricsQuery(
      page,
      itemsPerPage,
      cashierId,
      search,
      orderBy,
    );
    const players = await prisma.$queryRaw<PlayerWithUsageMetrics[]>(query);
    return players;
  }

  async update(cashier_id: string, data: CashierUpdateRequest) {
    return await CashierDAO.update({ where: { id: cashier_id }, data });
  }

  async showBalance(cashierId: string): Promise<number | undefined> {
    const cashier = await CashierDAO.findFirst({ where: { id: cashierId } });
    if (!cashier) throw new NotFoundException("Cajero no encontrado");

    const agent = await prisma.player.findAgent();
    const httpService = new HttpService(agent);
    const url = this.genereateBalanceRequestUrl(cashier);

    const response = await httpService.authedAgentApi.get<ComissionResponse>(
      url,
    );

    if (response.status !== 200)
      throw new AgentApiError(
        response.status,
        "Error en el casino al obtener el balance",
        response.data,
      );

    const result = Object.values(response.data)[0];

    if (!result) return;

    return Number(result.commission);
  }

  private genereateBalanceRequestUrl(cashier: Cashier): string {
    const endpoint = "/pyramid/agent/commissions/";
    const lastCashout = cashier.last_cashout.toISOString();
    const now = new Date().toISOString();
    const searchParams = new URLSearchParams();
    searchParams.append(
      "date_from",
      lastCashout.slice(0, lastCashout.lastIndexOf(":")) + "Z",
    );
    searchParams.append(
      "date_to",
      now.slice(0, lastCashout.lastIndexOf(":")) + "Z",
    );
    searchParams.append("username", cashier.username);

    return endpoint + "?" + searchParams.toString();
  }

  async cashout(cashierId: string, user: FullUser): Promise<CoinTransfer> {
    const coinTransferServices = new CoinTransferServices();
    const cashier = await CashierDAO.findFirst({ where: { id: cashierId } });
    if (!cashier) throw new NotFoundException("Cajero no encontrado");

    const balance = await this.showBalance(cashierId);
    if (!balance || balance === 0)
      throw new CustomError(ERR.CASHOUT_UNAVAILABLE);

    return useTransaction<CoinTransfer>(async (tx) => {
      const coinTransfer = await tx.coinTransfer.create({
        data: { status: COIN_TRANSFER_STATUS.PENDING },
      });

      await tx.cashierPayout.create({
        data: {
          coin_transfer_id: coinTransfer.id,
          player_id: user.id,
          amount: balance,
        },
      });

      await tx.cashier.update({
        where: { id: cashierId },
        data: { last_cashout: new Date() },
      });

      return await coinTransferServices.agentToPlayer(coinTransfer.id, tx);
    });
  }

  async playerGeneralReport(
    playerId: string,
    request: GeneralReportRequest,
    cashier: Cashier,
  ): Promise<GeneralReport> {
    const player = await PlayersDAO._getById(playerId);
    if (!player) throw new NotFoundException("Jugador no encontrado");

    const endpoint = `/pyramid/statistics/general_report/${cashier.panel_id}`;
    const params = new URLSearchParams();
    params.append("date_from", request.date_from);
    params.append("date_to", request.date_to);

    const url = endpoint + "?" + params.toString();

    const { authedAgentApi } = new HttpService(cashier);
    const response = await authedAgentApi.get<GeneralReport>(url);

    if (response.status !== 200)
      throw new AgentApiError(
        response.status,
        "Error en el casino al obtener reporte",
        response.data,
      );

    return response.data;
  }
}

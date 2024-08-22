import { Cashier, CoinTransfer, Player } from "@prisma/client";
import { CoinTransferServices } from "../coin-transfers/services";
import CONFIG, { COIN_TRANSFER_STATUS } from "@/config";
import { CashierDAO } from "@/db/cashier";
import { PlayersDAO } from "@/db/players";
import { OrderBy, PlayerRequest } from "@/types/request/players";
import { NotFoundException } from "@/helpers/error";
import { useTransaction } from "@/helpers/useTransaction";
import { RoledPlayer } from "@/types/response/players";
import { HttpService } from "@/services/http.service";
import { AgentApiError } from "@/helpers/error/AgentApiError";
import { generateRandomPassword } from "@/utils/auth";
import { encrypt } from "@/utils/crypt";

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
        commission,
      },
    });
  }

  private async createSubAgent(
    username: string,
    password: string,
    commission: number,
  ) {
    const url = "/pyramid/create/agent/";
    const httpService = new HttpService();
    const data = {
      username,
      password,
      agent_info: {
        payments_percentage: commission * 100,
      },
    };

    const response = await httpService.authedAgentApi.post(url, data);

    if (response.status !== 200)
      throw new AgentApiError(
        502,
        "Error en el casino al crear subagente",
        response.data,
      );
  }

  async listPlayers(
    page: number,
    itemsPerPage: number,
    search?: string,
    orderBy?: OrderBy<Player>,
    cashierId?: string,
  ) {
    return await PlayersDAO._getAllByCashier(
      page,
      itemsPerPage,
      search,
      orderBy,
      cashierId,
    );
  }

  async showBalance(cashierId: string) {
    const cashier = await CashierDAO.findFirst({ where: { id: cashierId } });
    if (!cashier) throw new NotFoundException("Cajero no encontrado");
    return cashier.balance;
  }

  async cashout(cashierId: string, user: RoledPlayer): Promise<CoinTransfer> {
    const coinTransferServices = new CoinTransferServices();
    const cashier = await CashierDAO.findFirst({ where: { id: cashierId } });
    if (!cashier) throw new NotFoundException("Cajero no encontrado");

    return useTransaction<CoinTransfer>(async (tx) => {
      const coinTransfer = await tx.coinTransfer.create({
        data: { status: COIN_TRANSFER_STATUS.PENDING },
      });

      await tx.cashierPayout.create({
        data: {
          coin_transfer_id: coinTransfer.id,
          player_id: user.id,
          amount: cashier.balance,
        },
      });

      await tx.cashier.update({
        where: { id: cashierId },
        data: { balance: 0 },
      });

      return await coinTransferServices.agentToPlayer(coinTransfer.id, tx);
    });
  }
}

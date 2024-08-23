import { Cashier, Player } from "@prisma/client";
import CONFIG from "@/config";
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
import { CashierUpdateRequest } from "@/types/request/cashier";

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
        handle: `@${username}`,
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

  async update(cashier_id: string, data: CashierUpdateRequest) {
    return await CashierDAO.update({ where: { id: cashier_id }, data });
  }

  // async showBalance(cashierId: string) {
  //   const cashier = await CashierDAO.findFirst({ where: { id: cashierId } });
  //   if (!cashier) throw new NotFoundException("Cajero no encontrado");
  //   return cashier.balance;
  // }

  // async cashout(cashierId: string, user: RoledPlayer): Promise<CoinTransfer> {
  //   const coinTransferServices = new CoinTransferServices();
  //   const cashier = await CashierDAO.findFirst({ where: { id: cashierId } });
  //   if (!cashier) throw new NotFoundException("Cajero no encontrado");

  //   return useTransaction<CoinTransfer>(async (tx) => {
  //     const coinTransfer = await tx.coinTransfer.create({
  //       data: { status: COIN_TRANSFER_STATUS.PENDING },
  //     });

  //     await tx.cashierPayout.create({
  //       data: {
  //         coin_transfer_id: coinTransfer.id,
  //         player_id: user.id,
  //         amount: cashier.balance,
  //       },
  //     });

  //     await tx.cashier.update({
  //       where: { id: cashierId },
  //       data: { balance: 0 },
  //     });

  //     return await coinTransferServices.agentToPlayer(coinTransfer.id, tx);
  //   });
  // }
}

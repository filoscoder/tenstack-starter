import { CoinTransfer } from "@prisma/client";
import { BonusServices } from "../bonus/services";
import { CoinTransferServices } from "../coin-transfers/services";
import { PaymentsDAO } from "@/db/payments";
import { CashoutRequest } from "@/types/request/transfers";
import { PlainPlayerResponse } from "@/types/response/players";
import { ResourceService } from "@/services/resource.service";
import { COIN_TRANSFER_STATUS, PAYMENT_STATUS } from "@/config";
import { useTransaction } from "@/helpers/useTransaction";

export class PaymentServices extends ResourceService {
  constructor() {
    super(PaymentsDAO);
  }
  /**
   * Transfer coins from player to agent and create a pending payment if coin
   * transfer is successful.
   */
  async create(
    player: PlainPlayerResponse,
    request: CashoutRequest,
  ): Promise<CoinTransfer | undefined> {
    await PaymentsDAO.authorizeCreation(request.bank_account, player.id);

    return await useTransaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          Player: { connect: { id: player.id } },
          amount: request.amount,
          BankAccount: { connect: { id: request.bank_account } },
          currency: player.balance_currency,
          status: PAYMENT_STATUS.PENDING,
          CoinTransfer: {
            create: { status: COIN_TRANSFER_STATUS.PENDING },
          },
        },
      });

      const bonusServices = new BonusServices(tx);
      await bonusServices.invalidate(player.id);

      const coinTransferServices = new CoinTransferServices();
      const coinTransfer = await coinTransferServices.playerToAgent(
        payment.coin_transfer_id,
        tx,
      );
      return coinTransfer;
    });
  }
}

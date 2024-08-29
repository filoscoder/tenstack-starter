import { OK } from "http-status";
import { Bonus, CoinTransfer, Deposit, Player } from "@prisma/client";
import { BonusServices } from "../bonus/services";
import { CoinTransferServices } from "../coin-transfers/services";
import { DepositServices } from "./services";
import { DepositsDAO } from "@/db/deposits";
import { apiResponse } from "@/helpers/apiResponse";
import {
  DepositRequest,
  SetDepositStatusRequest,
} from "@/types/request/transfers";
import { extractResourceSearchQueryParams } from "@/helpers/queryParams";
import { hidePassword } from "@/utils/auth";
import { DEPOSIT_STATUS } from "@/config";
import { DepositResult } from "@/types/response/transfers";
import { useTransaction } from "@/helpers/useTransaction";

export class DepositController {
  static readonly index = async (req: Req, res: Res, next: NextFn) => {
    try {
      const { page, itemsPerPage, search, orderBy } =
        extractResourceSearchQueryParams<Deposit & { Player: Player }>(req);

      const depositServices = new DepositServices();
      const deposits = await depositServices.getAll<
        Deposit & { Player: Player }
      >(page, itemsPerPage, search, orderBy);
      const result = deposits.map((deposit) => ({
        ...deposit,
        Player: hidePassword(deposit.Player),
      }));
      const total = await DepositsDAO.count();

      res.status(OK).json(apiResponse({ result, total }));
    } catch (err) {
      next(err);
    }
  };

  static readonly show = async (req: Req, res: Res, next: NextFn) => {
    const depositId = req.params.id;
    try {
      const depositServices = new DepositServices();
      const deposit = await depositServices.show<Deposit & { Player: Player }>(
        depositId,
      );
      if (deposit) deposit[0].Player = hidePassword(deposit[0].Player);

      res.status(OK).json(apiResponse(deposit));
    } catch (err) {
      next(err);
    }
  };
  /**
   * Create new deposit or verify existing
   */
  static readonly upsert = async (req: Req, res: Res, next: NextFn) => {
    const deposit_id = req.params.id;
    const request: Omit<DepositRequest, "player_id"> = req.body;
    const player = req.user!;

    const depositServices = new DepositServices(),
      coinTransferServices = new CoinTransferServices(),
      bonusServices = new BonusServices();
    let deposit:
        | (Deposit & { Player: Player & { Bonus: Bonus | null } })
        | undefined,
      bonus: Bonus | undefined,
      coinTransfer: CoinTransfer | undefined;

    try {
      if (deposit_id) {
        deposit = await depositServices.update(player, deposit_id, request);
      } else {
        deposit = await depositServices.create(player, request);
      }

      if (deposit.status === DEPOSIT_STATUS.VERIFIED) {
        coinTransfer = await useTransaction((tx) =>
          coinTransferServices.agentToPlayer(deposit!.coin_transfer_id, tx),
        ).catch(() => undefined);
        bonus = await bonusServices.load(
          deposit.amount,
          deposit.Player.Bonus?.id,
        );
      }

      deposit.Player = hidePassword(deposit.Player);
      res
        .status(OK)
        .json(apiResponse({ deposit, bonus, coinTransfer } as DepositResult));
    } catch (e) {
      next(e);
    }
  };

  static readonly setStatus = async (req: Req, res: Res, next: NextFn) => {
    const deposit_id = req.params.id;
    const request: SetDepositStatusRequest = req.body;
    const agent = req.user!;

    const depositServices = new DepositServices();
    try {
      const result = await depositServices.setStatus(
        agent,
        deposit_id,
        request,
      );
      res.status(OK).json(apiResponse(result));
    } catch (e) {
      next(e);
    }
  };

  /**
   * Show player's pending deposits
   */
  static readonly getPending = async (req: Req, res: Res, next: NextFn) => {
    const player = req.user!;

    try {
      const deposits = await DepositServices.showPending(player.id);
      res.status(OK).json(apiResponse(deposits));
    } catch (err) {
      next(err);
    }
  };
}

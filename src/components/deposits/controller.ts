import { OK } from "http-status";
import { Deposit, Player } from "@prisma/client";
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
import { COIN_TRANSFER_STATUS, DEPOSIT_STATUS } from "@/config";
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

    if (deposit_id) {
      this.update(req, res, next);
    } else {
      this.create(req, res, next);
    }
  };

  private static readonly update = async (req: Req, res: Res, next: NextFn) => {
    const deposit_id = req.params.id;
    const request: Omit<DepositRequest, "player_id"> = req.body;
    const player = req.user!;

    const depositServices = new DepositServices(),
      coinTransferServices = new CoinTransferServices(),
      bonusServices = new BonusServices();

    try {
      const deposit = await depositServices.update(player, deposit_id, request);
      deposit.Player = hidePassword(deposit.Player);

      if (
        deposit.CoinTransfer?.status === COIN_TRANSFER_STATUS.COMPLETED ||
        deposit.status !== DEPOSIT_STATUS.VERIFIED
      )
        return res
          .status(OK)
          .json(apiResponse({ deposit, coinTransfer: deposit.CoinTransfer }));

      const coinTransfer = await useTransaction((tx) =>
        coinTransferServices.agentToPlayer(deposit!.coin_transfer_id, tx),
      ).catch(() => undefined);

      const bonus = await bonusServices.load(
        deposit.amount,
        deposit.Player.Bonus?.id,
      );

      return res.status(OK).json(apiResponse({ deposit, bonus, coinTransfer }));
    } catch (e) {
      next(e);
      return;
    }
  };

  private static readonly create = async (req: Req, res: Res, next: NextFn) => {
    const request: Omit<DepositRequest, "player_id"> = req.body;
    const player = req.user!;

    const depositServices = new DepositServices(),
      coinTransferServices = new CoinTransferServices(),
      bonusServices = new BonusServices();

    try {
      const deposit = await depositServices.create(player, request);
      deposit.Player = hidePassword(deposit.Player);

      if (deposit.status !== DEPOSIT_STATUS.VERIFIED) {
        return res.status(OK).json(apiResponse({ deposit }));
      }

      const coinTransfer = await useTransaction((tx) =>
        coinTransferServices.agentToPlayer(deposit!.coin_transfer_id, tx),
      ).catch(() => undefined);

      const bonus = await bonusServices.load(
        deposit.amount,
        deposit.Player.Bonus?.id,
      );

      return res
        .status(OK)
        .json(apiResponse({ deposit, bonus, coinTransfer } as DepositResult));
    } catch (e) {
      next(e);
      return;
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
      result.Player = hidePassword(result.Player);
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

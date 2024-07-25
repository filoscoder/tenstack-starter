import { Bonus, Deposit, Player } from "@prisma/client";
import { OK } from "http-status";
import { BonusServices } from "./services";
import { BonusDAO } from "@/db/bonus";
import { apiResponse } from "@/helpers/apiResponse";
import { extractResourceSearchQueryParams } from "@/helpers/queryParams";
import { hidePassword } from "@/utils/auth";
import { CreateBonusProps } from "@/types/request/bonus";

export class BonusController {
  static readonly index = async (req: Req, res: Res, next: NextFn) => {
    try {
      const { page, itemsPerPage, search, orderBy } =
        extractResourceSearchQueryParams<Bonus>(req);

      const bonusServices = new BonusServices();
      const bonus = await bonusServices.getAll<Deposit & { Player: Player }>(
        page,
        itemsPerPage,
        search,
        orderBy,
      );
      const result = bonus.map((bonus) => ({
        ...bonus,
        Player: hidePassword(bonus.Player),
      }));
      const total = await BonusDAO.count();

      res.status(OK).json(apiResponse({ result, total }));
    } catch (err) {
      next(err);
    }
  };

  static readonly show = async (req: Req, res: Res, next: NextFn) => {
    const bonusId = req.params.id;
    const user = req.user!;
    try {
      await BonusDAO.authorizeView(bonusId, user);

      const bonusServices = new BonusServices();
      const bonus = await bonusServices.show<Bonus & { Player: Player }>(
        bonusId,
      );
      if (bonus) bonus[0].Player = hidePassword(bonus[0].Player);

      res.status(OK).json(apiResponse(bonus));
    } catch (err) {
      next(err);
    }
  };

  static readonly create = async (req: Req, res: Res, next: NextFn) => {
    const request: CreateBonusProps = req.body;
    const player = req.user!;

    const bonusServices = new BonusServices();
    try {
      const bonus = await bonusServices.create(request, player.id);
      res.status(OK).json(apiResponse(bonus));
    } catch (e) {
      next(e);
    }
  };

  // static readonly update = async (req: Req, res: Res, next: NextFn) => {
  //   const bonus_id = req.params.id;
  //   const request: BonusUpdatableProps = req.body;

  //   const bonusServices = new BonusServices();
  //   try {
  //     const result = await bonusServices.update(agent, bonus_id, request);
  //     res.status(OK).json(apiResponse(result));
  //   } catch (e) {
  //     next(e);
  //   }
  // };
}

import { NOT_FOUND, OK } from "http-status/lib";
import { Response } from "express";
import { PlayerServices } from "./services";
import { apiResponse } from "@/helpers/apiResponse";

export class PlayersController {
  /**
   * @description Gets the API information.
   * @param {Req} req
   * @param {Res} res
   */
  static getPlayerById = async (
    req: Req,
    res: Response<any, Record<string, any>>,
    next: NextFn,
  ) => {
    try {
      const playerId = parseInt(req.params.id);

      const playersServices = new PlayerServices();

      const player = await playersServices.getPlayerById(playerId);
      console.log("[getPlayerById]:: 23");

      if (player) {
        res.status(OK).json(apiResponse(player));
      } else {
        res.status(NOT_FOUND).json(apiResponse(null, "Player not found"));
      }
    } catch (error) {
      next(error);
    }
  };
}

import { NOT_FOUND, OK, CREATED } from "http-status/lib";
import { Request, Response } from "express";
import { PlayerDetails } from "usuarios";
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

      if (player) {
        res.status(OK).json(apiResponse(player));
      } else {
        res.status(NOT_FOUND).json(apiResponse(null, "Player not found"));
      }
    } catch (error) {
      next(error);
    }
  };

  static create = async (req: Request, res: Response, next: NextFn) => {
    try {
      const playersServices = new PlayerServices();

      const playerDetails: PlayerDetails = req.body;

      const player = await playersServices.create(playerDetails);

      res.status(CREATED).json(apiResponse(player));
    } catch (error) {
      next(error);
    }
  };
}

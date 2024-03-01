import { NOT_FOUND, OK, CREATED } from "http-status/lib";
import { Response } from "express";
import { PlayerServices } from "./services";
import { apiResponse } from "@/helpers/apiResponse";
import { Credentials, PlayerRequest } from "@/types/request/players";

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
      const playerId = req.user!.id;

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

  /**
   * Creates a player.
   */
  static create = async (req: Req, res: Res, next: NextFn) => {
    try {
      const playersServices = new PlayerServices();

      const request: PlayerRequest = req.body;

      const player = await playersServices.create(request);

      res.status(CREATED).json(apiResponse(player));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Login player
   */
  static login = async (req: Req, res: Res, next: NextFn) => {
    try {
      const playersServices = new PlayerServices();

      const credentials: Credentials = req.body;

      const loginResponse = await playersServices.login(credentials);

      res.status(OK).json(apiResponse(loginResponse));
    } catch (error) {
      next(error);
    }
  };
}

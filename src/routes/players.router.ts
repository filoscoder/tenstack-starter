import { Router } from "express";
import {
  PlayersController,
  validatePlayerId,
} from "@/components/players";

const playersRouter = Router();

playersRouter.get(
  "/:id",
  validatePlayerId,
  PlayersController.getPlayerById,
);

export default playersRouter;

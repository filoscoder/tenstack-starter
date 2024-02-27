import { Router } from "express";
import { checkExact } from "express-validator";
import { PlayersController, validatePlayerId } from "@/components/players";
import {
  validateCredentials,
  validatePlayerRequest,
} from "@/components/players/validators";
import { throwIfBadRequest } from "@/middlewares/requestErrorHandler";

const playersRouter = Router();

playersRouter.get(
  "/:id",
  validatePlayerId,
  checkExact(),
  throwIfBadRequest,
  PlayersController.getPlayerById,
);
// Post para crear usuarios
playersRouter.post(
  "/",
  validatePlayerRequest(),
  checkExact(),
  throwIfBadRequest,
  PlayersController.create,
);
// Post LogIn
playersRouter.post(
  "/login",
  validateCredentials(),
  checkExact(),
  throwIfBadRequest,
  PlayersController.login,
);
// Edicion de datos de usuarios: ej: Password
export default playersRouter;

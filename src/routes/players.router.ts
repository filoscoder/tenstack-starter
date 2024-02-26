import { Router } from "express";
import { PlayersController, validatePlayerId } from "@/components/players";
import {
  validateCredentials,
  validatePlayerRequest,
} from "@/components/players/validators";

const playersRouter = Router();

playersRouter.get("/:id", validatePlayerId, PlayersController.getPlayerById);
// Post para crear usuarios
playersRouter.post("/", validatePlayerRequest(), PlayersController.create);
// Post LogIn
playersRouter.post("/login", validateCredentials(), PlayersController.login);
// Edicion de datos de usuarios: ej: Password
export default playersRouter;

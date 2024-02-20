import { Router } from "express";
import { PlayersController, validatePlayerId } from "@/components/players";

const playersRouter = Router();

playersRouter.get("/:id", validatePlayerId, PlayersController.getPlayerById);
// Post para crear usuarios
// Post LogIn
// Edicion de datos de usuarios: ej: Password
export default playersRouter;

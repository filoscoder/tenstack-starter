import { Router } from "express";
import { PlayersController, validatePlayerId } from "@/components/players";
import { validatePlayerDetails } from "@/components/players/validators";

const playersRouter = Router();

playersRouter.get("/:id", validatePlayerId, PlayersController.getPlayerById);
// Post para crear usuarios
playersRouter.post("/", validatePlayerDetails, PlayersController.create);
// Post LogIn
// Edicion de datos de usuarios: ej: Password
export default playersRouter;

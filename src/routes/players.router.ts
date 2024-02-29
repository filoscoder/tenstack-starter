import { Router } from "express";
import { checkExact } from "express-validator";
import passport from "passport";
import { PlayersController, validatePlayerId } from "@/components/players";
import {
  validateCredentials,
  validatePlayerRequest,
} from "@/components/players/validators";
import { throwIfBadRequest } from "@/middlewares/requestErrorHandler";
import { requireUserRole } from "@/middlewares/auth";

const playersRouter = Router();

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
playersRouter.use(
  passport.authenticate("jwt", { session: false, failWithError: true }),
);
playersRouter.use(requireUserRole);
playersRouter.get(
  "/:id",
  validatePlayerId,
  throwIfBadRequest,
  PlayersController.getPlayerById,
);
// Edicion de datos de usuarios: ej: Password
export default playersRouter;

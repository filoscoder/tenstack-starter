import { Router } from "express";
import { checkExact } from "express-validator";
import passport from "passport";
import { PlayersController } from "@/components/players";
import {
  validateCredentials,
  validatePlayerRequest,
} from "@/components/players/validators";
import { throwIfBadRequest } from "@/middlewares/requestErrorHandler";
import { requireUserRole } from "@/middlewares/auth";
const playersRouter = Router();

playersRouter.post(
  "/",
  validatePlayerRequest(),
  checkExact(),
  throwIfBadRequest,
  PlayersController.create,
);
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
playersRouter.get("/", PlayersController.getPlayerById);

export default playersRouter;

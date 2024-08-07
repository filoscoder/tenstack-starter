import { Router } from "express";
import passport from "passport";
import { CoinTransferControler } from "@/components/coin-transfers/controller";
import { requireAgentRole } from "@/middlewares/auth";

const coinTransferRouter = Router();

coinTransferRouter.use(
  passport.authenticate("jwt", { session: false, failWithError: true }),
);
coinTransferRouter.use(requireAgentRole);
coinTransferRouter.get(
  "/release-pending",
  CoinTransferControler.releasePending,
);

export default coinTransferRouter;

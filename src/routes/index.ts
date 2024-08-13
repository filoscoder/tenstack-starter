import { Router } from "express";
import homeRouter from "./home.router";
import playersRouter from "./players.router";
import bankAccountsRouter from "./bank-accounts.router";
import agentRouter from "./agent.router";
import authRouter from "./auth.router";
import webPushRouter from "./web-push";
import botRouter from "./bot.router";
import transactionsRouter from "./transactions";
import analyticsRouter from "./analytics.router";
import bonusRouter from "./bonus.router";
import coinTransferRouter from "./coin-transfer.router";

const mainRouter = Router();

mainRouter.use("/", homeRouter);
mainRouter.use("/players", playersRouter);
mainRouter.use("/bank-account", bankAccountsRouter);
mainRouter.use("/transactions", transactionsRouter);
mainRouter.use("/agent", agentRouter);
mainRouter.use("/auth", authRouter);
mainRouter.use("/web-push", webPushRouter);
mainRouter.use("/bot", botRouter);
mainRouter.use("/analytics", analyticsRouter);
mainRouter.use("/bonus", bonusRouter);
mainRouter.use("/coin-transfer", coinTransferRouter);

export default mainRouter;

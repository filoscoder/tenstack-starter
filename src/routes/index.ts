import { Router } from "express";
import homeRouter from "./home.router";
import playersRouter from "./players.router";
import bankAccountsRouter from "./bank-accounts.router";
import transactionsRouter from "./transactions.router";
import agentRouter from "./agent.router";
import authRouter from "./auth.router";
import webPushRouter from "./web-push";
import botRouter from "./bot.router";

const mainRouter = Router();

mainRouter.use("/", homeRouter);
mainRouter.use("/players", playersRouter);
mainRouter.use("/bank-account", bankAccountsRouter);
mainRouter.use("/transactions", transactionsRouter);
mainRouter.use("/agent", agentRouter);
mainRouter.use("/auth", authRouter);
mainRouter.use("/web-push", webPushRouter);
mainRouter.use("/bot", botRouter);

export default mainRouter;

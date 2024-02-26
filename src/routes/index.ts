import { Router } from "express";
import homeRouter from "./home.router";
import playersRouter from "./players.router";
import bankAccountsRouter from "./bank-accounts.router";
import transactionsRouter from "./transactions.router";
import agentRouter from "./agent.router";
// import agentsRouter from "./agent.router";

const mainRouter = Router();

mainRouter.use("/", homeRouter);
mainRouter.use("/players", playersRouter);
mainRouter.use("/bank-account", bankAccountsRouter);
mainRouter.use("/transactions", transactionsRouter); // cashiIn, cashOut, y lista de transacciones pendientes de deposito.
mainRouter.use("/agent", agentRouter);

export default mainRouter;

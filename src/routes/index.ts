import { Router } from "express";
import homeRouter from "./home.router";
import playersRouter from "./players.router";
// import agentsRouter from "./agent.router";

const mainRouter = Router();

mainRouter.use("/", homeRouter);
mainRouter.use("/players", playersRouter);
// mainRouter.use("/bank-account", playersRouter);
// mainRouter.use("/transactions", agentsRouter); // cashiIn, cashOut, y lista de transacciones pendientes de deposito.
// mainRouter.use("/agent", agentsRouter);

export default mainRouter;

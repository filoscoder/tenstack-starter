import { Router } from "express";
import homeRouter from "./home.router";
import playersRouter from "./players.router";
// import agentsRouter from "./agent.router";

const mainRouter = Router();

mainRouter.use("/", homeRouter);
mainRouter.use("/players", playersRouter);

export default mainRouter;

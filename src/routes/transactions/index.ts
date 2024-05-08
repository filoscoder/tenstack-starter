import { Router } from "express";
import depositsRouter from "./deposits.router";
import paymentsRouter from "./payments.router";

const transactionsRouter = Router();

transactionsRouter.use(depositsRouter);
transactionsRouter.use(paymentsRouter);

export default transactionsRouter;

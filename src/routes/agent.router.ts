import { Router } from "express";
import { checkExact } from "express-validator";
import passport from "passport";
import { AgentController } from "@/components/agent/controller";
import { validateCredentials } from "@/components/players/validators";
import {
  validateBankAccountUpdate,
  validateDepositIndex,
  validateDepositUpdate,
  validateOnCallRequest,
  validatePaymentIndex,
} from "@/components/agent/validators";
import { throwIfBadRequest } from "@/middlewares/requestErrorHandler";
import { requireAgentRole } from "@/middlewares/auth";
import { TransactionsController } from "@/components/transactions";

const agentRouter = Router();

agentRouter.post(
  "/login",
  validateCredentials(),
  checkExact(),
  throwIfBadRequest,
  AgentController.login,
);
agentRouter.use(
  passport.authenticate("jwt", { session: false, failWithError: true }),
);
agentRouter.use(requireAgentRole);
agentRouter.get("/payments", AgentController.showPayments);
agentRouter.post(
  "/payments/:id/paid",
  validatePaymentIndex(),
  checkExact(),
  throwIfBadRequest,
  AgentController.markAsPaid,
);
agentRouter.get(
  "/deposits/:id?",
  validateDepositIndex(),
  throwIfBadRequest,
  AgentController.showDeposits,
);
agentRouter.post(
  "/deposits/:id",
  validateDepositUpdate(),
  throwIfBadRequest,
  TransactionsController.deposit,
);
agentRouter.get("/qr", AgentController.qr);
agentRouter.get("/bank-account", AgentController.getBankAccount);
agentRouter.post(
  "/bank-account",
  validateBankAccountUpdate(),
  checkExact(),
  throwIfBadRequest,
  AgentController.updateBankAccount,
);
agentRouter.get("/balance/casino", AgentController.getCasinoBalance);
agentRouter.get("/balance/alquimia", AgentController.getAlqBalance);
agentRouter.get("/pending/deposits", AgentController.completePendingDeposits);
agentRouter.post(
  "/on-call",
  validateOnCallRequest(),
  checkExact(),
  throwIfBadRequest,
  AgentController.setOnCallBotFlow,
);
agentRouter.get("/on-call", AgentController.getOnCallStatus);

export default agentRouter;

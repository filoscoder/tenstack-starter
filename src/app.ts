import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import timeout from "connect-timeout";
import passport from "passport";
import CONFIG from "./config";
import { AuthServices } from "./components/auth/services";
import * as errorHandler from "@/middlewares/errorHandler";
import mainRouter from "@/routes";

export const createApp = (): express.Application => {
  const app = express();

  const allowedOrigin = CONFIG.APP.ENV?.includes("dev")
    ? "http://localhost:3000"
    : CONFIG.APP.ALLOWED_ORIGIN;

  allowedOrigin !== "" && app.use(cors({ origin: allowedOrigin }));
  app.use(helmet());
  app.use(express.json());
  app.use(
    express.urlencoded({
      extended: true,
    }),
  );

  if (CONFIG.APP.ENV !== "test") {
    app.use(morgan("dev"));
  }

  app.use(timeout(CONFIG.SERVER.TIMEOUT));

  // API Routes (/app/v1/....)

  app.use(`/app/${CONFIG.APP.VER}`, mainRouter);

  // Error Middleware
  app.use(errorHandler.requestTimeoutHandler);
  app.use(errorHandler.customErrorHandler);
  app.use(errorHandler.authenticationErrorHandler);
  app.use(errorHandler.prismaErrorHandler);
  app.use(errorHandler.genericErrorHandler);
  app.use(errorHandler.notFoundError);

  const authServices = new AuthServices();
  passport.use(authServices.jwtStrategy());

  return app;
};

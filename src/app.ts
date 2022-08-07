import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import timeout from "connect-timeout";
import CONFIG from "./config";
import { expressPinoLogger } from "./helpers";
import * as errorHandler from "@/middlewares/errorHandler";
import routes from "@/routes";

export const createApp = (): express.Application => {
  const app = express();

  app.use(cors());
  app.use(helmet());
  app.use(express.json());
  app.use(
    express.urlencoded({
      extended: true,
    }),
  );

  if (CONFIG.APP.ENV !== "test") {
    app.use(morgan("dev"));
    app.use(expressPinoLogger);
  }

  app.use(timeout(CONFIG.SERVER.TIMEOUT));

  // API Routes
  app.use(`/api/${CONFIG.APP.VER}`, routes);

  // Error Middleware
  app.use(errorHandler.genericErrorHandler);
  app.use(errorHandler.notFoundError);

  return app;
};

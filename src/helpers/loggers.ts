import httpStatus from "http-status/lib";
import expressPino from "express-pino-logger";
import pino from "pino";
import { hidePassword } from "@/utils/auth";
import CONFIG from "@/config";

const { OK, BAD_REQUEST, INTERNAL_SERVER_ERROR } = httpStatus;

const token = CONFIG.AUTH.LOGTAIL_TOKEN;
const transport = pino.transport({
  target: "@logtail/pino",
  options: { sourceToken: token },
});
/**
 * Log errors into logtail
 */
export const logtailLogger = pino(transport);

// More info: https://github.com/pinojs/express-pino-logger
export const expressPinoConsoleLogger = () =>
  expressPino({
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: true,
      },
    },
    customLogLevel(res, err) {
      const status = res.statusCode;
      if (status >= 400 && status < 500) {
        return "warn";
      }
      if (status >= 500 || err) {
        return "error";
      }
      return "silent";
    },
    customErrorMessage: (err) => `${err.name} : ${err.message}`,
    customSuccessMessage(res) {
      const status = res.statusCode;

      if (status >= 400 && status < 500) {
        return `${status || BAD_REQUEST} : ${
          // @ts-ignore
          httpStatus[status] || httpStatus[BAD_REQUEST]
        }`;
      }
      if (status >= 500) {
        return `${status || INTERNAL_SERVER_ERROR} : ${
          // @ts-ignore
          httpStatus[status || 500]
        }`;
      }
      return `${OK} : ${httpStatus[200].toUpperCase()}`;
    },
    serializers: {
      req: (req) => {
        const {
          method,
          url,
          headers: { host },
        } = req;
        return {
          origin: host,
          method,
          url,
          query: req.query,
          params: req.params,
          body: hidePassword({ ...req.raw.body }),
        };
      },
      res: (res) => {
        return {
          status: res.statusCode,
        };
      },
      err: (err) => `${err.type} : ${err.message}`,
    },
  });

export const exitLog = (err: any, evt: string) => {
  if (err) {
    process.stdout.write(`\n\n[!ERROR][${evt}] => ${err}\n\n`);
    console.error(err);
  } else {
    process.stdout.write(`\n\n![${evt}] EVENT CAUSE EXIT\n\n`);
  }

  process.exit(err ? 1 : 0);
};

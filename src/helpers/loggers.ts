import httpStatus from "http-status/lib";
import expressPino from "express-pino-logger";
import { hidePassword } from "@/utils/auth";

const { OK, BAD_REQUEST, SERVER_ERROR } = httpStatus;

// More info: https://github.com/pinojs/express-pino-logger
export const expressPinoLogger = expressPino({
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
      return `${status || BAD_REQUEST} : ${httpStatus[status || 400]}`;
    }
    if (status >= 500) {
      return `${status || SERVER_ERROR} : ${httpStatus[status || 500]}`;
    }
    return `${OK} : ${httpStatus[200].toUpperCase()}`;
  },
  serializers: {
    req: (req) => {
      // console.log('[ R E Q U E S T ] => ', req.raw);
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
      // console.log("[ R E S P O N S E ] => ", res);
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
  } else {
    process.stdout.write(`\n\n![${evt}] EVENT CAUSE EXIT\n\n`);
  }

  process.exit(err ? 1 : 0);
};

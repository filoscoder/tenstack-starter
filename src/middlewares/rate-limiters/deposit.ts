import { RateLimiterMemory } from "rate-limiter-flexible";
import { DepositRequest } from "@/types/request/transfers";
import { CustomError } from "@/middlewares/errorHandler";
import { ERR } from "@/config/errors";
import CONFIG from "@/config";

const rateLimiter = new RateLimiterMemory({
  points: CONFIG.APP.ENV === CONFIG.SD.ENVIRONMENTS.TEST ? 10 : 1,
  duration: 10,
});

/**
 * Limit the amount of requests with the same tracking_number to 1 every
 * 10 seconds
 */
export const depositRateLimiter = (req: Req, res: Res, next: NextFn) => {
  rateLimiter
    .consume((req.body as DepositRequest).tracking_number, 1)
    .then(() => next())
    .catch((err): void => {
      res.header("Retry-After", `${err.msBeforeNext / 1000}`);
      next(new CustomError(ERR.TOO_MANY_REQUESTS));
    });
};

import { RateLimiterMemory } from "rate-limiter-flexible";
import CONFIG, { ENVIRONMENTS } from "@/config";
import { ERR } from "@/config/errors";
import { CustomError } from "@/helpers/error/CustomError";

const rateLimiter = new RateLimiterMemory({
  points: CONFIG.APP.ENV === ENVIRONMENTS.TEST ? 10 : 1,
  duration: 10,
});

/**
 * Limit the amount of requests with the same bonus ID to 1 every
 * 10 seconds
 */
export const bonusRateLimiter = (req: Req, res: Res, next: NextFn) => {
  rateLimiter
    .consume(req.params.id, 1)
    .then(() => next())
    .catch((err): void => {
      res.header("Retry-After", `${err.msBeforeNext / 1000}`);
      next(new CustomError(ERR.TOO_MANY_REQUESTS));
    });
};

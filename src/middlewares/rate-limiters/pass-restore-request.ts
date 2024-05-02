import { RateLimiterMemory } from "rate-limiter-flexible";
import { ERR } from "@/config/errors";
import CONFIG from "@/config";
import { CustomError } from "@/helpers/error/CustomError";
import { PasswordRestoreRequest } from "@/types/request/pass-restore";

const rateLimiter = new RateLimiterMemory({
  points: CONFIG.APP.ENV === CONFIG.SD.ENVIRONMENTS.DEV ? 10 : 1,
  duration: 600,
});

/**
 * Limit the amount of requests with the same username to 1 every
 * 10 minutes
 */
export const forgotPasswordRateLimiter = (req: Req, res: Res, next: NextFn) => {
  rateLimiter
    .consume((req.body as PasswordRestoreRequest).username, 1)
    .then(() => next())
    .catch((err): void => {
      res.header("Retry-After", `${err.msBeforeNext / 1000}`);
      next(new CustomError(ERR.TOO_MANY_REQUESTS));
    });
};

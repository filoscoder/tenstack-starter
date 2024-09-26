import { CorsOptions } from "cors";
import CONFIG from "@/config";
import { CustomError } from "@/helpers/error/CustomError";

export const corsOptions: CorsOptions = {
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);

    const allowedOrigins = CONFIG.APP.ALLOWED_ORIGIN?.split(",").map((o) =>
      o.trim(),
    );

    if (allowedOrigins?.includes(origin)) return cb(null, true);

    cb(new CustomError({ status: 400, code: "cors", description: "" }), false);
  },
};

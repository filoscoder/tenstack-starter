import { CorsOptions } from "cors";
import CONFIG from "@/config";

export const corsOptions: CorsOptions = {
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);

    const allowedOrigins = CONFIG.APP.ALLOWED_ORIGIN?.split(",").map((o) =>
      o.trim(),
    );

    if (allowedOrigins?.includes(origin)) return cb(null, true);

    cb(new Error("not allowed by CORS"));
  },
};

import CONFIG from "@/config";

export function cors(req: Req, res: Res, next: NextFn) {
  const allowedOriginsArray = CONFIG.APP.ALLOWED_ORIGIN?.split("\n");
  const origin = req.headers.origin;

  if (!allowedOriginsArray || !origin) return next();

  if (allowedOriginsArray.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
    res.header("Access-Control-Allow-Methods", "GET, POST");
  }
  next();
}

import CONFIG from "@/config";

export function cors(req: Req, res: Res, next: NextFn) {
  const allowedOriginsArray = CONFIG.APP.ALLOWED_ORIGIN?.split(",");
  const origin = req.headers.origin;

  if (!allowedOriginsArray || !origin) return next();

  allowedOriginsArray?.forEach((origin, i, arr) => (arr[i] = origin.trim()));

  if (allowedOriginsArray.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
    res.header("Access-Control-Allow-Methods", "GET, POST");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  }
  next();
}

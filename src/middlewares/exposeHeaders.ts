export const exposeHeaders = (_req: Req, res: Res, next: NextFn) => {
  res.header("Access-Control-Expose-Headers", "retry-after");
  next();
};

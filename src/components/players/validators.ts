import { NOT_FOUND } from "http-status";
import { apiResponse } from "@/helpers/apiResponse";

export const validatePlayerId = (req: Req, res: Res, next: NextFn) => {
  const { id } = req.params;
  const playerId = parseInt(id);

  if (isNaN(playerId)) {
    return res.status(NOT_FOUND).json(apiResponse(null, "Invalid player ID"));
  }

  return next();
};

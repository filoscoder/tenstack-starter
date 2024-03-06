import { OK } from "http-status";
import { AuthServices } from "./services";
import { apiResponse } from "@/helpers/apiResponse";

export class AuthController {
  static async refresh(req: Req, res: Res, next: NextFn) {
    try {
      const authServices = new AuthServices();
      const { token } = req.body;

      const refreshed = await authServices.refresh(token);

      res.status(OK).send(apiResponse(refreshed));
    } catch (error) {
      next(error);
    }
  }
}

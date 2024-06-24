import { OK } from "http-status";
import { AuthServices } from "./services";
import { apiResponse } from "@/helpers/apiResponse";

export class AuthController {
  static async refresh(req: Req, res: Res, next: NextFn) {
    try {
      const authServices = new AuthServices();
      const { token } = req.body;

      const refreshed = await authServices.refresh(token, req);

      res.status(OK).send(apiResponse(refreshed));
    } catch (error) {
      next(error);
    }
  }

  static async logout(req: Req, res: Res, next: NextFn) {
    try {
      const authServices = new AuthServices();
      const { token } = req.body;
      const user_id = req.user!.id;

      await authServices.logout(user_id, token);

      res.status(OK).send(apiResponse(null));
    } catch (error) {
      next(error);
    }
  }
}

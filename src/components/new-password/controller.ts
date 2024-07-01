import { OK } from "http-status";
import { PlayerServices } from "../players/services";
import { NewPasswordServices } from "./services";
import { apiResponse } from "@/helpers/apiResponse";

export class NewPasswordController {
  static async create(req: Req, res: Res, next: NextFn) {
    const SUCCESS_MESSAGE =
      "Te vamos a mandar un mail con instrucciones para resetear tu contraseña";
    try {
      const newPasswordServices = new NewPasswordServices();
      const { username } = req.body;

      newPasswordServices.forgotPassword(username);

      res.status(OK).send(apiResponse(SUCCESS_MESSAGE));
    } catch (error) {
      next(error);
    }
  }

  static async store(req: Req, res: Res, next: NextFn) {
    try {
      const playerServices = new PlayerServices();
      const { new_password } = req.body;
      const user = req.user!;

      await playerServices.resetPassword(user, new_password);

      res.status(OK).send(apiResponse(null));
    } catch (error) {
      next(error);
    }
  }
}

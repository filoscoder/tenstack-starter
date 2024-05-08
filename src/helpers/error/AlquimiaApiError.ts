import { CustomError } from "./CustomError";

export class AlquimiaApiError extends CustomError {
  constructor(status: number, description: string, detail: any) {
    super({
      status,
      code: "alquimia",
      description,
      detail,
    });
  }
}

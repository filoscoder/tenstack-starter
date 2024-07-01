import { CustomError } from "./CustomError";

export class AgentApiError extends CustomError {
  constructor(status: number, description: string, detail: any) {
    super({
      status,
      code: "agent_api_error",
      description,
      detail,
    });
  }
}

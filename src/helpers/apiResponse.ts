import HttpStatus, { NOT_FOUND, OK } from "http-status/lib";
import { ApiSuccessResponse } from "@/types/response";

export const apiResponse = <T>(
  data?: T,
  errorMessage?: string,
): ApiSuccessResponse<T> => {
  if (!data && errorMessage) {
    return {
      status: NOT_FOUND, // Puedes usar otro código de estado según sea necesario
      message: errorMessage,
    };
  }
  return {
    status: OK,
    message: HttpStatus[OK] as string,
    data,
  };
};

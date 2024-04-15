import HttpStatus, { OK } from "http-status/lib";
import { CustomError } from "./error/CustomError";
import { ApiSuccessResponse } from "@/types/response";

export const apiResponse = <T>(
  data?: T,
  error?: CustomError,
): ApiSuccessResponse<T> => {
  if (!data && error) {
    return {
      status: error.status,
      code: error.code,
      data: error.description as T,
    };
  }
  return {
    status: OK,
    code: HttpStatus[OK] as string,
    data,
  };
};

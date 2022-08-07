import HttpStatus, { OK } from "http-status/lib";
import { ApiSuccessResponse } from "@/types/response";

export const apiResponse = <T>(data?: T): ApiSuccessResponse<T> => {
  return {
    status: OK,
    message: HttpStatus[OK] as string,
    data,
  };
};

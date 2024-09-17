import { randomBytes } from "crypto";
import { CustomError } from "@/helpers/error/CustomError";

/**
 * @description hide password content with '*'
 * @param {object} bodyData
 * @returns bodyData with formatted 'password'
 */
export const hidePassword = <T extends Object>(bodyData: T): T => {
  if (bodyData.hasOwnProperty("password")) {
    // @ts-ignore
    bodyData.password = "********";
  }
  if (bodyData.hasOwnProperty("panel_id")) {
    // @ts-ignore
    bodyData.panel_id = "********";
  }

  return bodyData;
};

/**
 * Generates a 128 byte long cryptographically strong password
 */
export function generateRandomPassword(): Promise<string> {
  return new Promise((resolve) => {
    randomBytes(128, (err, buf) => {
      if (err)
        throw new CustomError({
          status: 500,
          code: "internal_server_error",
          description: "Error al generar contraseña.",
        });
      resolve(buf.toString("hex"));
    });
  });
}

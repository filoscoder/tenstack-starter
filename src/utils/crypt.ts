import {
  scryptSync,
  randomFillSync,
  createCipheriv,
  createDecipheriv,
} from "crypto";
import bcrypt from "bcrypt";
import CONFIG from "@/config";
import { CustomError } from "@/middlewares/errorHandler";
import { ErrorData } from "@/types/response/error";

/**
 * @description Create a bcrypt hash for a string.
 * @param {string} value
 * @returns {Promise<any>}
 */
export const hash = async (value: string): Promise<string> => {
  const saltRounds = parseInt(CONFIG.AUTH.SALT_ROUNDS, 10);

  return bcrypt.hash(value, saltRounds);
};

/**
 * @description Compare a string with the hash.
 * @param {string} value
 * @param {string} hashedValue
 * @returns {Promise<boolean>}
 */
export const compare = async (
  value: string,
  hashedValue: string,
): Promise<boolean> => {
  return bcrypt.compare(value, hashedValue);
};

/**
 * Encript a string using aes192
 * @param text Plain text string to encript
 * @returns Encripted string
 */
export function encrypt(text: string): string {
  const { algorithm, key } = getConfig();

  try {
    // Generate a random initialization vector
    const iv = randomFillSync(new Uint8Array(16));

    const cipher = createCipheriv(algorithm, key, iv);

    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");

    return JSON.stringify({
      // Serialize IV into an array
      ivArray: iv.toString().split(","),
      ciphertext: encrypted,
    });
  } catch (error) {
    throw new CustomError({
      status: 500,
      code: "crypt",
      description: "Error encriptando contraseña",
    });
  }
}

/**
 * Decript a string
 * @param encrypted Encripted string
 * @returns Decripted string
 */
export function decrypt(encrypted: string): string {
  const { algorithm, key } = getConfig();

  const { ivArray, ciphertext } = JSON.parse(encrypted);

  // Deserialize IV
  const iv = Uint8Array.from(ivArray);

  const decipher = createDecipheriv(algorithm, key, iv);

  let decrypted = decipher.update(ciphertext, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

function getConfig() {
  const algorithm = "aes-192-cbc";
  const password = CONFIG.APP.CYPHER_PASS;
  const PASS_NOT_FOUND_ERROR: ErrorData = {
    status: 500,
    code: "env",
    description:
      "Contraseña para encriptado no encontrada. Asegurate de setear CYPHER_PASS en .env",
  };

  if (!password) throw new CustomError(PASS_NOT_FOUND_ERROR);
  // Generate key
  // Key length for aes192 is 24 bytes (192 bits)
  const key = scryptSync(password, "salt", 24);

  return { algorithm, key };
}

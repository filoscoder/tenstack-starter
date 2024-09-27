import { PrismaClient } from "@prisma/client";
import { CustomError } from "./error/CustomError";
import { TransactionCallback } from "@/types/helpers/useTransaction";

const transactionOptions = {
  maxWait: 3500,
  timeout: 10000,
};

export async function useTransaction<T>(
  cb: TransactionCallback<T>,
): Promise<T> {
  const prisma = new PrismaClient();
  const MAX_RETRIES = 3;
  let retries = 0;

  while (retries < MAX_RETRIES) {
    try {
      return await prisma.$transaction(
        async (tx) => cb(tx),
        transactionOptions,
      );
    } catch (e: any) {
      if (e.code === "P2034") {
        retries++;
        continue;
      }
      throw e;
    } finally {
      prisma.$disconnect();
    }
  }

  throw new CustomError({
    status: 500,
    code: "database",
    description: "Error en la base de datos",
  });
}

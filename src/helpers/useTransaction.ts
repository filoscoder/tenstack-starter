import { PrismaClient } from "@prisma/client";
import { TransactionCallback } from "@/types/helpers/useTransaction";

export async function useTransaction<T>(
  cb: TransactionCallback<T>,
): Promise<T | undefined> {
  const prisma = new PrismaClient();
  const MAX_RETRIES = 3;
  let retries = 0;

  while (retries < MAX_RETRIES) {
    try {
      return await prisma.$transaction(async (tx) => cb(tx));
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

  return;
}

import { AlquimiaDeposit, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class AlquimiaDepositDAO {
  static findByTrackingNumber(trackingNumber: string) {
    try {
      return prisma.alquimiaDeposit.findUnique({
        where: { clave_rastreo: trackingNumber },
      });
    } catch (e) {
      throw e;
    } finally {
      prisma.$disconnect();
    }
  }

  static findLatest() {
    try {
      return prisma.alquimiaDeposit.findFirst({
        orderBy: { fecha_operacion: "asc" },
      });
    } catch (e) {
      throw e;
    } finally {
      prisma.$disconnect();
    }
  }

  /**
   * Insert multiple records whilst skipping duplicates
   */
  static createMany(data: AlquimiaDeposit[]) {
    try {
      return prisma.alquimiaDeposit.createMany({ data, skipDuplicates: true });
    } catch (e) {
      throw e;
    } finally {
      prisma.$disconnect();
    }
  }
}

import { PrismaClient } from "@prisma/client";
import {
  WebPushSubscription,
  WebPushUpdatableProps,
} from "@/types/request/web-push";

const prisma = new PrismaClient();

export class WebPushDAO {
  static findAll() {
    try {
      return prisma.pushSubscription.findMany();
    } catch (error) {
      throw error;
    } finally {
      prisma.$disconnect();
    }
  }

  static upsert(
    endpoint: string,
    update: WebPushUpdatableProps,
    data: WebPushSubscription,
  ) {
    try {
      return prisma.pushSubscription.upsert({
        where: { endpoint },
        update,
        create: { endpoint: data.endpoint, keys: JSON.stringify(data.keys) },
      });
    } catch (error) {
      throw error;
    } finally {
      prisma.$disconnect();
    }
  }

  static deleteByEndpoint(endpoint: string) {
    try {
      return prisma.pushSubscription.delete({ where: { endpoint } });
    } catch (error) {
      throw error;
    } finally {
      prisma.$disconnect();
    }
  }
}

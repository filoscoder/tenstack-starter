import { PrismaClient } from "@prisma/client";
import { RootUpdatableProps, RootRequest } from "@/types/request/user-root";

const prisma = new PrismaClient();

export class UserRootDAO {
  static getAgent() {
    try {
      return prisma.userRoot.findFirst();
    } catch (error) {
      throw error;
    }
  }

  static update(username: string, data: RootUpdatableProps) {
    try {
      return prisma.userRoot.update({
        where: { username: username },
        data,
      });
    } catch (error) {
      throw error;
    }
  }

  static upsert(
    username: string,
    update: RootUpdatableProps,
    create: RootRequest,
  ) {
    try {
      return prisma.userRoot.upsert({
        where: { username },
        update,
        create,
      });
    } catch (error) {
      throw error;
    }
  }
}

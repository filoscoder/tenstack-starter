import { BankAccount, Player, PrismaClient, Role } from "@prisma/client";
import {
  PlainPlayerResponse,
  PlayerResponse,
  RoledPlayer,
} from "@/types/response/players";
import {
  OrderBy,
  PlayerRequest,
  PlayerUpdatableProps,
  getPlayerId,
} from "@/types/request/players";
import { parsePlayer } from "@/utils/parser";
import CONFIG from "@/config";
import { ForbiddenError } from "@/helpers/error";

const prisma = new PrismaClient();

export class PlayersDAO {
  static get count() {
    try {
      return prisma.player.count();
    } catch (e) {
      throw e;
    } finally {
      prisma.$disconnect();
    }
  }

  static _getAll = async (
    page: number,
    itemsPerPage: number,
    search?: string,
    orderBy?: OrderBy<Player>,
  ): Promise<Player[]> => {
    try {
      const playersPrisma = await prisma.player.findMany({
        skip: page * itemsPerPage,
        take: itemsPerPage,
        where: {
          roles: { some: { name: CONFIG.ROLES.PLAYER } },
          AND: {
            OR: [
              { first_name: { contains: search } },
              { last_name: { contains: search } },
              { email: { contains: search } },
              { username: { contains: search } },
              { movile_number: { contains: search } },
            ],
          },
        },
        orderBy,
      });
      return playersPrisma;
    } catch (error: any) {
      throw error;
    } finally {
      prisma.$disconnect();
    }
  };
  /**
   * @description Get player information by ID.
   * @param playerId ID of the player to retrieve information.
   * @returns Raw player, including sensitive data
   */
  static _getById = async (
    playerId: getPlayerId,
  ): Promise<
    (Player & { BankAccounts: BankAccount[]; roles: Role[] }) | null
  > => {
    try {
      const playerPrisma = await prisma.player.findUnique({
        where: { id: playerId },
        include: { BankAccounts: true, roles: true },
      });

      return playerPrisma;
    } catch (error: any) {
      throw error;
    } finally {
      prisma.$disconnect();
    }
  };

  /**
   * Find Player by username
   * @returns Full Player, including password
   */
  static getByUsername = async (
    username: string,
  ): Promise<RoledPlayer | null> => {
    try {
      const playerPrisma = await prisma.player.findUnique({
        where: { username: username },
        include: { roles: true },
      });

      return playerPrisma;
    } catch (error: any) {
      throw error;
    } finally {
      prisma.$disconnect();
    }
  };

  /**
   * Find Player by email
   * @returns { PlayerResponse }
   */
  static getByEmail = async (email: string): Promise<PlayerResponse | null> => {
    try {
      const playerPrisma = await prisma.player.findUnique({
        where: { email },
      });

      return parsePlayer(playerPrisma);
    } catch (error: any) {
      throw error;
    } finally {
      prisma.$disconnect();
    }
  };

  static getAgent = () => {
    try {
      return prisma.player.findFirst({
        where: {
          roles: {
            some: { name: CONFIG.ROLES.AGENT },
          },
        },
      });
    } catch (error: any) {
      throw error;
    } finally {
      prisma.$disconnect();
    }
  };

  static create = async (
    request: PlayerRequest,
  ): Promise<PlainPlayerResponse> => {
    try {
      const player = await prisma.player.create({
        data: {
          ...request,
          roles: {
            connect: { name: CONFIG.ROLES.PLAYER },
          },
        },
      });
      return player;
    } catch (error: any) {
      throw error;
    } finally {
      prisma.$disconnect();
    }
  };

  static upsert = (
    username: string,
    update: PlayerUpdatableProps,
    create: PlayerRequest,
  ) => {
    try {
      return prisma.player.upsert({
        where: { username },
        update,
        create: {
          ...create,
          roles: {
            connect: { name: CONFIG.ROLES.PLAYER },
          },
        },
      });
    } catch (error) {
      throw error;
    } finally {
      prisma.$disconnect();
    }
  };

  static update = (playerId: string, update: PlayerUpdatableProps) => {
    try {
      return prisma.player.update({
        where: { id: playerId },
        data: update,
      });
    } catch (error) {
      throw error;
    } finally {
      prisma.$disconnect();
    }
  };

  static authorizeShow(user: RoledPlayer, user_id: string): void {
    if (user.roles.some((role) => role.name === CONFIG.ROLES.AGENT)) return;

    if (user.id !== user_id) throw new ForbiddenError("No autorizado");
  }
}

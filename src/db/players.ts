import { Player, PrismaClient } from "@prisma/client";
import {
  PlainPlayerResponse,
  PlayerResponse,
  RoledPlayer,
} from "@/types/response/players";
import {
  PlayerRequest,
  PlayerUpdatableProps,
  getPlayerId,
} from "@/types/request/players";
import { parsePlayer } from "@/utils/parser";
import CONFIG from "@/config";

const prisma = new PrismaClient();

export class PlayersDAO {
  /**
   * @description Get player information by ID.
   * @param playerId ID of the player to retrieve information.
   * @returns Raw player, including sensitive data
   */
  static _getById = async (playerId: getPlayerId): Promise<Player | null> => {
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
}

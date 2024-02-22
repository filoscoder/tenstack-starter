import { PrismaClient } from "@prisma/client";
import { PlainPlayerResponse, PlayerResponse } from "@/types/response/players";
import { PlayerRequest, getPlayerId } from "@/types/request/players";
import { parsePlayer } from "@/utils/parser";

const prisma = new PrismaClient();

export class PlayersDAO {
  /**
   * @description Get player information by ID.
   * @param playerId ID of the player to retrieve information.
   * @returns Player | null
   */
  static getById = async (
    playerId: getPlayerId,
  ): Promise<PlayerResponse | null> => {
    try {
      const playerPrisma = await prisma.player.findUnique({
        where: { id: playerId },
        include: { BankAccounts: true },
      });

      return parsePlayer(playerPrisma);
    } catch (error: any) {
      throw error;
    }
  };

  /**
   * Find Player by username
   * @returns Full Player, including password
   */
  static getByUsername = async (
    username: string,
  ): Promise<PlainPlayerResponse | null> => {
    try {
      const playerPrisma = await prisma.player.findUnique({
        where: { username: username },
      });

      return playerPrisma;
    } catch (error: any) {
      throw error;
    }
  };

  static create = async (
    request: PlayerRequest,
  ): Promise<PlainPlayerResponse> => {
    try {
      const player = await prisma.player.create({ data: request });
      return player;
    } catch (error: any) {
      throw error;
    }
  };

  static upsert = prisma.player.upsert;
}

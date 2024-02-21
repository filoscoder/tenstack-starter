import { PrismaClient } from "@prisma/client";
import { PlainPlayerResponse, PlayerResponse } from "@/types/response/players";
import { PlayerRequest, getPlayerId } from "@/types/request/players";
import { hidePassword } from "@/utils/auth";

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
      throw new Error(`Error getting player by ID: ${error.message}`);
    }
  };

  static getByUsername = async (
    username: string,
  ): Promise<PlainPlayerResponse | null> => {
    try {
      const playerPrisma = await prisma.player.findUnique({
        where: { username: username },
      });

      if (!playerPrisma) return null;

      return hidePassword<PlainPlayerResponse>(playerPrisma);
    } catch (error: any) {
      throw new Error(`Error getting player by username: ${error.message}`);
    }
  };

  static create = async (
    request: PlayerRequest,
  ): Promise<PlainPlayerResponse> => {
    const player = await prisma.player.create({ data: request });
    return hidePassword(player);
  };
}

const parsePlayer = (playerDB: any): PlayerResponse | null => {
  return !playerDB
    ? null
    : {
        id: playerDB.id,
        panel_id: playerDB.panel_id,
        username: playerDB.username,
        email: playerDB.email,
        first_name: playerDB.first_name,
        last_name: playerDB.last_name,
        date_of_birth: playerDB.date_of_birth,
        movile_number: playerDB.movile_number,
        country: playerDB.country,
        bank_accounts: playerDB.BankAccounts,
        balance_currency: playerDB.balance_currency,
        status: playerDB.status,
        created_at: playerDB.created_at,
        updated_at: playerDB.updated_at,
      };
};

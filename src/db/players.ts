import { PrismaClient } from "@prisma/client";
import { Player } from "@/types/response/players";
import { getPlayerId } from "@/types/request/players";

const prisma = new PrismaClient();

export class PlayersDAO {
  /**
   * @description Get player information by ID.
   * @param playerId ID of the player to retrieve information.
   * @returns Player | null
   */
  static getById = async (playerId: getPlayerId): Promise<Player | null> => {
    try {
      const playerPrisma = await prisma.player.findUnique({
        where: { id: playerId },
      });
    
      return parsePlayer(playerPrisma);
    } catch (error: any) {
      throw new Error(`Error getting player by ID: ${error.message}`);

    }
  };
}

const parsePlayer = (playerDB: any): Player | null => {
  return !playerDB ? null : {
      id: playerDB.id,
      panel_id: playerDB.panel_id,
      username: playerDB.username,
      password: playerDB.password,
      email: playerDB.email,
      first_name: playerDB,
      last_name: playerDB,
      date_of_birth: playerDB,
      movile_number: playerDB,
      country: playerDB,
      // BankAccounts      BankAccount[]
      balance_currency: playerDB,
      status: playerDB,
      // Payments          Payment[]
      // Deposits          Deposit[]
      created_at: playerDB,
      updated_at: playerDB,      
    };
}

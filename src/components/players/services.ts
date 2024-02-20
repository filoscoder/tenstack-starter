import { PlayersDAO } from "@/db/players";
import { getPlayerId } from "@/types/request/players";
import { Player } from "@/types/response/players";

export class PlayerServices {
  /**
   * @description Get player information by ID.
   * @param playerId ID of the player to retrieve information.
   * @returns Player
   */
  getPlayerById = async (playerId: getPlayerId): Promise<Player | null> => {
    
    const player = await PlayersDAO.getById(playerId);
    return player;
  };
}

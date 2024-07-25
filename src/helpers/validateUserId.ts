import CONFIG from "@/config";
import { PlayersDAO } from "@/db/players";

export const validatePlayerId = async (id: string) => {
  const user = await PlayersDAO._getById(id);
  if (!user?.roles.some((r) => r.name === CONFIG.ROLES.PLAYER))
    throw new Error();
};

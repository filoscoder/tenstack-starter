import { Player as PrismaPlayer } from "@prisma/client";
import { PlayersDAO } from "@/db/players";
import { PlayerRequest, getPlayerId } from "@/types/request/players";
import { PlayerResponse } from "@/types/response/players";
import { hash } from "@/utils/crypt";
import { hidePassword } from "@/utils/auth";
import { CustomError, ERR } from "@/middlewares/errorHandler";
import { HttpService } from "@/services/http.service";

export class PlayerServices {
  /**
   * @description Get player information by ID.
   * @param playerId ID of the player to retrieve information.
   * @returns Player
   */
  getPlayerById = async (
    playerId: getPlayerId,
  ): Promise<PlayerResponse | null> => {
    const player = await PlayersDAO.getById(playerId);
    return player;
  };

  create = async (player: PlayerRequest): Promise<PrismaPlayer> => {
    const panelSignUpUrl = "/pyramid/create/player/";
    const playerLoginUrl = "/accounts/login/";
    const { authedAgentApi, playerApi } = new HttpService();

    // Crear el usuario en panel
    let response = await authedAgentApi.post(panelSignUpUrl, player);

    if (response.status !== 201 && response.status !== 400) {
      throw new CustomError({
        status: 500,
        code: "error_panel",
        description: "Error en el panel al crear el usuario",
      });
    }

    if (response.status === 400 && response.data.code === "already_exists") {
      // Usuario existe en el panel, verificar que esté en local
      const localPlayer = await PlayersDAO.getByUsername(player.username);

      // Usuario existe en panel y en local. Devolver "Ya existe"
      if (localPlayer) throw new CustomError(ERR.USER_ALREADY_EXISTS);

      // Usuario existe en panel pero no en local, loguearlo para obtener
      // su panel_id
      response = await playerApi.post(playerLoginUrl, player);
      // Credenciales inválidas
      if (response.status !== 200)
        throw new CustomError(ERR.USER_ALREADY_EXISTS);
    }

    // Crear usuario en local
    player.panel_id = response.data.id;
    player.password = await hash(player.password);
    const localPlayer = await PlayersDAO.create(player);
    return hidePassword(localPlayer);
  };
}

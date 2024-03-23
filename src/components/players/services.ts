import { Player } from "@prisma/client";
import { AuthServices } from "../auth/services";
import { PlayersDAO } from "@/db/players";
import {
  Credentials,
  PlayerRequest,
  getPlayerId,
} from "@/types/request/players";
import { LoginResponse, PlainPlayerResponse } from "@/types/response/players";
import { compare, hash } from "@/utils/crypt";
import { hidePassword } from "@/utils/auth";
import { CustomError, ERR } from "@/middlewares/errorHandler";
import { HttpService } from "@/services/http.service";

export class PlayerServices {
  /**
   * @description Get player information by ID.
   * @param playerId ID of the player to retrieve information.
   * @returns Player
   */
  getPlayerById = async (playerId: getPlayerId): Promise<Player | null> => {
    const player = await PlayersDAO._getById(playerId);
    if (!player) return null;

    return hidePassword<Player>(player);
  };

  /**
   * Create player
   * @throws if user exists or something goes wrong
   */
  create = async (player: PlayerRequest): Promise<PlainPlayerResponse> => {
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

    if (
      response.status === 400 &&
      (response.data.code === "already_exists" ||
        response.data.code === "user_already_exists")
    ) {
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

  /**
   * Log in player
   */
  login = async (
    credentials: Credentials,
    user_agent?: string,
  ): Promise<LoginResponse> => {
    // Verificar user y pass en nuestra DB
    const player = await PlayersDAO.getByUsername(credentials.username);

    if (player && (await compare(credentials.password, player.password))) {
      return await this.loginResponse(player, user_agent);
    }

    // Usuario no está en local o contraseña es incorrecta
    // Chequear en casino
    const { playerApi } = new HttpService();
    const loginResponse = await playerApi.post("/accounts/login/", credentials);

    if (loginResponse.status == 200 && loginResponse.data.access) {
      const localPlayer = await this.updatePlayerPassword(
        credentials,
        loginResponse.data.id,
      );
      return await this.loginResponse(localPlayer, user_agent);
    } else throw new CustomError(ERR.INVALID_CREDENTIALS);
  };

  private async updatePlayerPassword(credentials: Credentials, id: number) {
    return PlayersDAO.upsert(
      credentials.username,
      { password: await hash(credentials.password) },
      {
        username: credentials.username,
        password: await hash(credentials.password),
        panel_id: id,
      },
    );
  }

  private async loginResponse(
    player: Player,
    user_agent?: string,
  ): Promise<LoginResponse> {
    const authServices = new AuthServices();
    await authServices.invalidateTokensByUserAgent(player.id, user_agent);
    const { tokens } = await authServices.tokens(player.id, user_agent);
    return { ...tokens, player: hidePassword(player) };
  }
}

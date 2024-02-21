import { PlayerDetails } from "usuarios";
import { PrismaClient, Player as PrismaPlayer } from "@prisma/client";
import axios from "axios";
import CONFIG from "@/config";
import { PlayersDAO } from "@/db/players";
import { getPlayerId } from "@/types/request/players";
import { Player } from "@/types/response/players";
import { HttpService } from "@/services/http.service";
import { hash } from "@/utils/crypt";
import { hidePassword } from "@/utils/auth";
import { CustomError, ErrorData } from "@/middlewares/errorHandler";

export class PlayerServices {
  private _httpService: HttpService;
  private _prisma: PrismaClient;

  private _alreadyExistsError: ErrorData = {
    status: 400,
    code: "ya_existe",
    description: "Un usuario con ese nombre ya existe",
  };

  constructor() {
    this._httpService = new HttpService();
    this._prisma = new PrismaClient();
  }

  /**
   * @description Get player information by ID.
   * @param playerId ID of the player to retrieve information.
   * @returns Player
   */
  getPlayerById = async (playerId: getPlayerId): Promise<Player | null> => {
    const player = await PlayersDAO.getById(playerId);
    return player;
  };

  create = async (player: PlayerDetails): Promise<PrismaPlayer> => {
    const panelSignUpUrl =
      CONFIG.EXTERNAL.AGENT_BASE_URL + "/pyramid/create/player/";
    const panelLoginUrl = CONFIG.EXTERNAL.PLAYER_BASE_URL + "/accounts/login/";

    // Crear el usuario en panel
    let response = await this._httpService.post(panelSignUpUrl, player);

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
      if (localPlayer) throw new CustomError(this._alreadyExistsError);

      // Usuario existe en panel pero no en local
      response = await axios.post(panelLoginUrl, player);
      // Credenciales inválidas
      if (response.status !== 200)
        throw new CustomError(this._alreadyExistsError);
    }

    // Crear usuario en local
    player.panel_id = response.data.id;
    player.password = await hash(player.password);
    // const localPlayer = await prisma.player.create({ data: player });
    const localPlayer = await PlayersDAO.create(player);
    this._prisma.$disconnect();
    return hidePassword(localPlayer);
  };
}

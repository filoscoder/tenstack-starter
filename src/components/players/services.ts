import { Player } from "@prisma/client";
import { AuthServices } from "../auth/services";
import { PlayersDAO } from "@/db/players";
import {
  Credentials,
  PlayerRequest,
  PlayerUpdateRequest,
} from "@/types/request/players";
import { PlainPlayerResponse } from "@/types/response/players";
import { compare, hash } from "@/utils/crypt";
import { hidePassword } from "@/utils/auth";
import { HttpService } from "@/services/http.service";
import { ERR } from "@/config/errors";
import { CustomError } from "@/helpers/error/CustomError";
import { AgentApiError } from "@/helpers/error/AgentApiError";
import { Mail } from "@/helpers/email/email";
import { TokenDAO } from "@/db/token";
import { Whatsapp } from "@/notification/whatsapp";
import CONFIG, { PLAYER_STATUS } from "@/config";
import { ForbiddenError } from "@/helpers/error";
import { ResourceService } from "@/services/resource.service";
import { logtailLogger } from "@/helpers/loggers";
import { AuthResult } from "@/types/response/auth";

export class PlayerServices extends ResourceService {
  constructor() {
    super(PlayersDAO);
  }
  /**
   * Create player
   * @throws if user exists or something goes wrong
   */
  create = async (player: PlayerRequest): Promise<PlainPlayerResponse> => {
    const panel_id = await this.createCasinoPlayer(
      player.username,
      player.password,
    );

    const localPlayer = await this.createLocalPlayer(panel_id, player);

    if (player.movile_number) {
      await Whatsapp.send(
        player.movile_number,
        CONFIG.SD.PLAYER_WELCOME_MESSAGE,
      );
    }

    return hidePassword(localPlayer);
  };

  private async createCasinoPlayer(
    username: string,
    password: string,
  ): Promise<number> {
    const playerLoginUrl = "/accounts/login/";
    const panelSignUpUrl = "/pyramid/create/player/";
    const { authedAgentApi, playerApi } = new HttpService();

    let response = await authedAgentApi.post<any>(panelSignUpUrl, {
      username,
      password,
    });

    if (response.status !== 201 && response.status !== 400)
      throw new AgentApiError(
        response.status,
        "Error en el panel al crear el usuario",
        response.data,
      );
    if (
      response.status === 400 &&
      (response.data.code === "already_exists" ||
        response.data.code === "user_already_exists")
    ) {
      // Usuario existe en el panel, verificar que esté en local
      const localPlayer = await PlayersDAO.getByUsername(username);

      // Usuario existe en panel y en local. Devolver "Ya existe"
      if (localPlayer) throw new CustomError(ERR.USER_ALREADY_EXISTS);

      // Usuario existe en panel pero no en local, loguearlo para obtener
      // su panel_id
      response = await playerApi.post(playerLoginUrl, { username, password });
      // Credenciales inválidas
      if (response.status !== 200)
        throw new CustomError(ERR.USER_ALREADY_EXISTS);
    }
    return response.data.id;
  }

  private async createLocalPlayer(
    panel_id: number,
    player: PlayerRequest,
  ): Promise<PlainPlayerResponse> {
    player.panel_id = panel_id;
    player.password = await hash(player.password);
    return await PlayersDAO.create(player);
  }

  /**
   * Log in player
   */
  login = async (credentials: Credentials): Promise<AuthResult> => {
    // Verificar user y pass en nuestra DB
    const player = await PlayersDAO.getByUsername(credentials.username);

    if (player?.status === PLAYER_STATUS.BANNED)
      throw new ForbiddenError("Usuario bloqueado");

    if (player && (await compare(credentials.password, player.password))) {
      return await this.loginResponse(player);
    }

    // Usuario no está en local o contraseña es incorrecta
    // Chequear en casino
    const { playerApi } = new HttpService();
    const loginResponse = await playerApi.post("/accounts/login/", credentials);

    if (loginResponse.status == 200 && loginResponse.data.access) {
      const localPlayer = await this.updatePlayerPassword(
        credentials,
        loginResponse.data.id,
        loginResponse.data.email,
      );
      return await this.loginResponse(localPlayer);
    } else throw new CustomError(ERR.INVALID_CREDENTIALS);
  };

  private async updatePlayerPassword(
    credentials: Credentials,
    id: number,
    email: string,
  ) {
    return PlayersDAO.upsert(
      credentials.username,
      { password: await hash(credentials.password) },
      {
        username: credentials.username,
        password: await hash(credentials.password),
        panel_id: id,
        email,
      },
    );
  }

  private async loginResponse(player: Player): Promise<AuthResult> {
    const authServices = new AuthServices();
    const { tokens, fingerprintCookie } = await authServices.tokens(player.id);
    return {
      loginResponse: { ...tokens, player: hidePassword(player) },
      fingerprintCookie,
    };
  }

  async resetPassword(user: Player, new_password: string): Promise<void> {
    const { authedAgentApi } = new HttpService();
    const url = `users/${user.panel_id}/change-password/`;

    const response = await authedAgentApi.post<any>(url, { new_password });

    if (response.status !== 200)
      throw new CustomError({
        status: response.status,
        code: "agent_api_error",
        description: "Reset failed",
        detail: response.data,
      });

    await this.emailPasswordResetConfirmation(user);
    await TokenDAO.update({ player_id: user.id }, { invalid: true });
  }

  private async emailPasswordResetConfirmation(user: Player) {
    try {
      const subject = "Contraseña reestablecida";
      const body = "Tu contraseña ha sido reestablecida.";
      const cta = {
        name: "Iniciar sesión",
        href: "https://casino-mex.com",
      };
      const mail = new Mail();
      mail.compose(subject, user.username, body, cta).send(user.email);
    } catch (e) {
      logtailLogger.warn(e, "Error sending email");
    }
  }

  async update(player_id: string, request: PlayerUpdateRequest) {
    const player = await PlayersDAO.update(player_id, request);

    if (player.status === PLAYER_STATUS.BANNED)
      await TokenDAO.update({ player_id }, { invalid: true });

    return hidePassword(player);
  }
}

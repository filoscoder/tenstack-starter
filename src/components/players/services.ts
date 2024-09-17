import { Bonus, Cashier, Player } from "@prisma/client";
import { AuthServices } from "../auth/services";
import { PlayersDAO } from "@/db/players";
import {
  Credentials,
  PlayerRequest,
  PlayerUpdateRequest,
} from "@/types/request/players";
import {
  CertainUserResponse,
  FullUser,
  PlainPlayerResponse,
  RoledPlayer,
} from "@/types/response/players";
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
import { ForbiddenError, NotFoundException } from "@/helpers/error";
import { ResourceService } from "@/services/resource.service";
import { logtailLogger } from "@/helpers/loggers";
import { AuthResult } from "@/types/response/auth";
import { BonusDAO } from "@/db/bonus";
import { CashierDAO } from "@/db/cashier";
import { prisma } from "@/prisma";

export class PlayerServices extends ResourceService {
  constructor() {
    super(PlayersDAO);
  }
  /**
   * Create player
   * @throws if user exists or something goes wrong
   */
  create = async (player: PlayerRequest): Promise<PlainPlayerResponse> => {
    const cashier = await this.findAgent(player.cashier_id);

    const panel_id = await this.createCasinoPlayer(
      player.username,
      player.password,
      cashier,
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

  private async findAgent(cashier_id?: string) {
    const cashier = cashier_id
      ? await CashierDAO.findFirst({ where: { id: cashier_id } })
      : await prisma.player.findAgent();

    if (!cashier) throw new NotFoundException("Cajero no encontrado");

    return cashier;
  }

  private async createCasinoPlayer(
    username: string,
    password: string,
    cashier: Cashier,
  ): Promise<number> {
    const playerLoginUrl = "/accounts/login/";
    const panelSignUpUrl = "/pyramid/create/player/";
    const { authedAgentApi, playerApi } = new HttpService(cashier);

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
  login = async (
    credentials: Credentials,
    user_agent: string,
  ): Promise<AuthResult> => {
    // Verificar user y pass en nuestra DB
    const player = await PlayersDAO.getByUsername(credentials.username);

    if (player?.status === PLAYER_STATUS.BANNED)
      throw new ForbiddenError("Usuario bloqueado");

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
        loginResponse.data.email,
      );
      return await this.loginResponse(localPlayer, user_agent);
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
        roles: [CONFIG.ROLES.PLAYER],
      },
    );
  }

  private async loginResponse(
    player: Player,
    user_agent: string,
  ): Promise<AuthResult> {
    const authServices = new AuthServices();
    const { tokens } = await authServices.tokens(player.id, user_agent);
    return {
      loginResponse: { ...tokens, player: hidePassword(player) },
    };
  }

  async resetPassword(user: FullUser, new_password: string): Promise<void> {
    const agent = await prisma.player.findAgent();
    const { authedAgentApi } = new HttpService(agent);
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

  async getBalance(player_id: string, player: RoledPlayer): Promise<number> {
    await PlayersDAO.authorizeShow(player, player_id);

    const agent = await prisma.player.findAgent();
    const httpService = new HttpService(agent);
    const response = await httpService.authedAgentApi.get<CertainUserResponse>(
      `/pyramid/certain-user/${player.panel_id}`,
    );
    if (response.status !== 200)
      throw new AgentApiError(
        response.status,
        "Error en el casino al obtener info de jugador",
        response.data,
      );

    return Number(response.data.balance);
  }

  async getBonus(player_id: string, player: RoledPlayer): Promise<Bonus[]> {
    await PlayersDAO.authorizeShow(player, player_id);
    return BonusDAO.findMany({ Player: { id: player_id } });
  }
}

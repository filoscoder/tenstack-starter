import { AgentConfig, PrismaClient } from "@prisma/client";
import { JwtService } from "./jwt.service";
import { HttpService } from "./http.service";
import CONFIG from "@/config";
import { ERR } from "@/config/errors";
import {
  AlqApiManagerTokenResponse,
  AlqToken,
  AlqTokenResponse,
} from "@/types/response/alquimia";
import { ITokenRetreiver } from "@/types/services/http";
import { CustomError } from "@/helpers/error/CustomError";
import { PlayersDAO } from "@/db/players";
import { RootUpdatableProps } from "@/types/request/user-root";

export class AlquimiaTokenService
  extends JwtService
  implements ITokenRetreiver
{
  tokenNames = ["alquimiaToken", "apiManagerToken"];

  private _apiManagerToken!: string;
  private _alquimiaTokenResult!: AlqToken;
  private _httpService: HttpService;

  private get basicAuth(): string {
    const basicAuth = CONFIG.AUTH.ALQUIMIA_BASIC_AUTH;
    if (!basicAuth) throw new CustomError(ERR.ALQ_AUTH_NOT_FOUND);
    return basicAuth;
  }

  constructor() {
    super();
    this._httpService = new HttpService();
  }

  async getAuth(): Promise<string[] | null> {
    try {
      const apiManagerToken = await this._cachedApiManagerToken();
      const alquimiaToken = await this._cachedAlquimiaToken();
      if (!apiManagerToken || !alquimiaToken) {
        return null;
      }
      return [apiManagerToken, alquimiaToken];
    } catch (e) {
      return null;
    }
  }

  async authenticate(): Promise<string[] | null> {
    try {
      const apiManagerToken = await this._fetchApiManagerToken();
      const alquimiaToken = await this._alquimiaToken();
      if (!apiManagerToken || !alquimiaToken) {
        return null;
      }
      return [apiManagerToken, alquimiaToken];
    } catch (e) {
      return null;
    }
  }

  private async _cachedApiManagerToken(): Promise<string | null> {
    if (
      this._apiManagerToken &&
      this.verifyTokenExpiration(this._apiManagerToken)
    )
      return this._apiManagerToken;

    const agent = await this.fetchAgentFromDb();
    if (!agent || !agent.alq_api_manager) return null;

    this._apiManagerToken = agent.alq_api_manager;
    return this._apiManagerToken;
  }

  private async _fetchApiManagerToken(): Promise<string> {
    const response =
      await this._httpService.plainAlquimiaApi.post<AlqApiManagerTokenResponse>(
        "token",
        "grant_type=client_credentials",
        {
          headers: {
            Authorization: `Basic ${this.basicAuth}`,
          },
        },
      );

    if (response.status !== 200) throw new CustomError(ERR.ALQ_TOKEN_ERROR);

    this._apiManagerToken = response.data.access_token;
    await this.updateAgentConfig({ alq_api_manager: this._apiManagerToken });
    return this._apiManagerToken;
  }

  private async _alquimiaToken(): Promise<string> {
    return (await this._cachedAlquimiaToken()) || this._fetchAlquimiaToken();
  }

  private async _cachedAlquimiaToken() {
    if (this._verifyAlqToken(this._alquimiaTokenResult))
      return this._alquimiaTokenResult.token;

    const agent = await this.fetchAgentFromDb();
    if (!agent || !agent.alq_token) return null;

    const parsed = JSON.parse(agent.alq_token) as AlqToken;
    if (!this._verifyAlqToken(parsed)) return null;
    this._alquimiaTokenResult = parsed;
    return this._alquimiaTokenResult.token;
  }

  private async _fetchAlquimiaToken() {
    const response = await this._httpService.alqTokenApi.post<AlqTokenResponse>(
      "",
      "grant_type=password&client_id=testclient&client_secret=testpass" +
        `&username=${CONFIG.AUTH.ALQUIMIA_USERNAME}` +
        `&password=${CONFIG.AUTH.ALQUIMIA_PASSWORD}`,
    );

    if (response.status !== 200) throw new CustomError(ERR.ALQ_TOKEN_ERROR);

    await this._processAlqToken(response.data);

    return this._alquimiaTokenResult.token;
  }

  private async _processAlqToken(data: AlqTokenResponse) {
    this._alquimiaTokenResult = {
      token: data.access_token,
      expires_at: Date.now() / 1000 + data.expires_in,
    };
    await this.updateAgentConfig({
      alq_token: JSON.stringify(this._alquimiaTokenResult),
    });
  }

  private _verifyAlqToken(data?: AlqToken) {
    if (!data) return false;
    if (data.expires_at < Date.now() / 1000 + 10) return false;
    return true;
  }

  private async fetchAgentFromDb(): Promise<AgentConfig> {
    const agent = await PlayersDAO.findFirst({
      where: { roles: { every: { name: CONFIG.ROLES.AGENT } } },
      select: { AgentConfig: true },
    });
    if (!agent?.AgentConfig) throw new CustomError(ERR.AGENT_UNSET);
    return agent.AgentConfig;
  }

  private updateAgentConfig(data: RootUpdatableProps) {
    const prisma = new PrismaClient();
    return prisma.agentConfig.updateMany({
      where: { Player: { roles: { every: { name: CONFIG.ROLES.AGENT } } } },
      data,
    });
  }
}

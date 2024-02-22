import axios from "axios";
import { TokenService } from "./token.service";
import CONFIG from "@/config";

export class HttpService {
  private _tokenService: TokenService;
  private _token: string | null = null;

  /**
   * Configure axios for agent requests with base URL and authorization header.
   */
  private get agentAxiosInstance() {
    return axios.create({
      baseURL: CONFIG.EXTERNAL.AGENT_BASE_URL,
      headers: {
        Authorization: `Bearer ${this._token}`,
      },
      validateStatus: () => true,
    });
  }

  /**
   * Expose methods for authenticated agent to call external API.
   */
  public get authedAgentApi() {
    return {
      post: (url: string, data: any) => this.agentPost(url, data),
      patch: (url: string, data: any) => this.agentPatch(url, data),
    };
  }

  /**
   * Axios instance for non-authenticated agent request.
   * Example: token refresh.
   */
  public get plainAgentApi() {
    return axios.create({
      baseURL: CONFIG.EXTERNAL.AGENT_BASE_URL,
      validateStatus: () => true,
    });
  }

  /**
   * Expose axios instance for player requests.
   */
  public get playerApi() {
    return axios.create({
      baseURL: CONFIG.EXTERNAL.PLAYER_BASE_URL,
      validateStatus: () => true,
    });
  }

  constructor() {
    this._tokenService = new TokenService();
  }

  private async agentPost(url: string, data: any) {
    return await this.send("post", url, data);
  }

  private async agentPatch(url: string, data: any) {
    return await this.send("patch", url, data);
  }

  private async send(method: string, url: string, data: any): Promise<any> {
    try {
      this._token = await this._tokenService.token();
      if (!this._token) {
        this._token = await this.handleTokenExpiration();
      }
      const response = await this.agentAxiosInstance({ url, method, data });
      if (response.status === 401) {
        this._token = await this.handleTokenExpiration();
        if (!this._token) {
          return await this.delay(() => this.send(method, url, data));
        }

        return await this.agentAxiosInstance({ url, method, data });
      }

      return response;
    } catch (error) {
      throw error;
    }
  }

  private async handleTokenExpiration(retry = 3): Promise<string | null> {
    if (retry <= 0) {
      return null;
    }
    return this.delay(async () => {
      this._token = await this._tokenService.login();

      if (!this._token) {
        return this.handleTokenExpiration(retry - 1);
      }

      return this._token;
    });
  }

  private async delay(cb: CallableFunction): Promise<any> {
    return new Promise((resolve) => {
      setTimeout(async () => resolve(cb ? await cb() : undefined), 500);
    });
  }
}

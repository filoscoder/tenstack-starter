import axios, { AxiosResponse } from "axios";
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
    let response: AxiosResponse<any, any> | null = null;

    // Intentar con token de memoria, bbdd o refresh token
    this._token = await this._tokenService.token();
    if (this._token) {
      response = await this.agentAxiosInstance({ url, method, data });
    }

    // Token inválido o expirado.
    // Si llegamos hasta acá es porque ambos tokens estaban expirados
    // o fueron invalidados por un login
    if (!response || response.status === 401) {
      this._token = await this._tokenService.login();

      // Si login() devuelve null significa que el agente está siendo logueado.
      // Esperar 500ms y volver a empezar
      if (!this._token)
        return await this.delay(() => this.send(method, url, data));

      // Intentar de nuevo con token fresco
      return await this.agentAxiosInstance({ url, method, data });
    } else return response;
  }

  private async delay(cb: CallableFunction) {
    return new Promise((resolve) => {
      setTimeout(() => resolve(cb()), 500);
    });
  }
}

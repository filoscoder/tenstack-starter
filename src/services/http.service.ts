import axios from "axios";
import { TokenService } from "./token.service";

export class HttpService {
  private _tokenService: TokenService;

  //   private get tokenService(): TokenService {
  //     if (!this._tokenService)
  //     return serviceProvider.tokenService;
  //   }

  // private get tokenService() {
  //   return serviceProvider.tokenService;
  // }

  constructor() {
    this._tokenService = new TokenService();
  }

  /** URL base para las APIs de agente */
  get agentApiBaseUrl() {
    if (process.env.AGENT_API_BASE_URL) return process.env.AGENT_API_BASE_URL;
    else
      throw new Error(
        "URL base no encontrada. Recordá setear EXTERNAL_API_BASE_URL en .env",
      );
  }

  /** URL base para APIs de jugador */
  get playerApiBaseUrl() {
    if (process.env.PLAYER_API_BASE_URL) return process.env.PLAYER_API_BASE_URL;
    else
      throw new Error(
        "URL base no encontrada. Recordá setear PLAYER_API_BASE_URL en .env",
      );
  }

  async post(url: string, data: any) {
    return await this.send("post", url, data);
  }

  async patch(url: string, data: any) {
    return await this.send("patch", url, data);
  }

  async send(method: string, url: string, data: any): Promise<any> {
    let token: string | null = null;
    let response;

    // Intentar con token de memoria, bbdd o refresh token
    token = await this._tokenService.token();
    if (token) {
      response = await this.axiosWrapper(method, url, data, token);
    }

    // Token inválido o expirado.
    // Si llegamos hasta acá es porque ambos tokens estaban expirados
    // o fueron invalidados por un login
    if (!token || response.status === 401) {
      token = await this._tokenService.login();

      // Si login() devuelve null significa que el agente está siendo logueado.
      // Esperar 500ms y volver a empezar
      if (!token) return await this.delay(() => this.send(method, url, data));

      // Intentar de nuevo con token fresco
      return await this.axiosWrapper(method, url, data, token);
    } else return response;
  }

  async delay(cb: CallableFunction) {
    return new Promise((resolve) => {
      setTimeout(() => resolve(cb()), 500);
    });
  }

  /**
   * Injects Bearer token into axios post method and configs axios not to throw
   * on status code >= 300
   * @param url Url to send request to
   * @param data Data to send on request body
   * @param token Bearer token
   * @returns Promise
   */
  axiosWrapper(
    method: string,
    url: string,
    data: any,
    token: string,
  ): Promise<any> {
    return axios({
      url,
      method,
      data,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      // Resolver la promesa para todos los status codes
      validateStatus: () => true,
    });
  }

  /**
   * Asegurarse que todos los datos necesarios esten presentes en requests
   * entrantes
   * @param req El pedido a validar
   * @param args Los argumentos que se esperan en el request
   */
  //   static validate(req: any, args: string[]) {
  //     const err: ErrorData = {
  //       status: 400,
  //       code: "faltan_datos",
  //       description: "",
  //     };
  //     for (const arg of args) {
  //       // @ts-ignore
  //       if (!req[arg]) err.description += `Falta argumento ${arg}. `;
  //     }
  //     if (err.description) throw new CustomError(err);
  //   }
}

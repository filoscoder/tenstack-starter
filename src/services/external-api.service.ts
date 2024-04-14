import axios, { AxiosInstance } from "axios";
import { CasinoTokenService } from "./casino-token.service";
import { AlquimiaTokenService } from "./alquimia-token.service";
import { ITokenRetreiver } from "@/types/services/http";
import { ERR } from "@/config/errors";
import { CustomError } from "@/middlewares/errorHandler";
import CONFIG from "@/config";

/**
 * Handle communications with different external APIs
 */
export class ExternalApiService {
  private _auth!: string[] | null;
  private _tokenService!: ITokenRetreiver;

  protected set tokenService(service: ITokenRetreiver) {
    if (
      service instanceof CasinoTokenService ||
      service instanceof AlquimiaTokenService
    ) {
      this._tokenService = service;
    } else throw new TypeError("Invalid token service");
  }

  private get _alquimiaBaseUrl(): string {
    const url = `${CONFIG.EXTERNAL.ALQ_BASE_URL}${CONFIG.EXTERNAL.ALQ_API_VERSION}`;
    if (!url) throw new CustomError(ERR.ALQ_URL_NOT_FOUND);
    return url;
  }

  protected get authedApi() {
    return {
      get: (url: string) => this.authedGet(url),
      post: (url: string, data: any) => this.authedPost(url, data),
      patch: (url: string, data: any) => this.authedPatch(url, data),
    };
  }

  private get _authedAxiosInstance(): AxiosInstance {
    if (this._tokenService instanceof CasinoTokenService)
      return axios.create({
        baseURL: CONFIG.EXTERNAL.AGENT_BASE_URL,
        headers: {
          Authorization: `Bearer ${this._auth ? this._auth[0] : ""}`,
        },
        validateStatus: () => true,
      });
    else if (this._tokenService instanceof AlquimiaTokenService)
      return axios.create({
        baseURL: this._alquimiaBaseUrl,
        headers: {
          Authorization: `Bearer ${this._auth ? this._auth[0] : ""}`,
          AuthorizationAlquimia: `Bearer ${this._auth ? this._auth[1] : ""}`,
        },
        validateStatus: () => true,
      });
    else throw new TypeError("Invalid token service");
  }

  protected async authedGet(url: string) {
    return await this.send("get", url, null);
  }

  protected async authedPost(url: string, data: any) {
    return await this.send("post", url, data);
  }

  protected async authedPatch(url: string, data: any) {
    return await this.send("patch", url, data);
  }

  private async send(method: string, url: string, data: any): Promise<any> {
    try {
      this._auth = await this._tokenService.getAuth();
      if (!this._auth) {
        this._auth = await this.handleTokenExpiration();
      }

      const response = await this._authedAxiosInstance({ url, method, data });
      if (response.status === 401) {
        this._auth = await this.handleTokenExpiration();
        if (!this._auth) {
          throw new CustomError(ERR.EXTERNAL_LOGIN);
        }

        return await this._authedAxiosInstance({ url, method, data });
      }

      return response;
    } catch (error) {
      throw error;
    }
  }

  private async handleTokenExpiration(retry = 3): Promise<string[] | null> {
    if (retry <= 0) {
      return null;
    }
    return this.delay(async () => {
      this._auth = await this._tokenService.authenticate();

      if (!this._auth) {
        return this.handleTokenExpiration(retry - 1);
      }

      return this._auth;
    });
  }

  private async delay(cb: CallableFunction): Promise<any> {
    return new Promise((resolve) => {
      setTimeout(async () => resolve(cb ? await cb() : undefined), 500);
    });
  }
}

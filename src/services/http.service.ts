import axios from "axios";
import { CasinoTokenService } from "./casino-token.service";
import { ExternalApiService } from "./external-api.service";
import { AlquimiaTokenService } from "./alquimia-token.service";
import CONFIG from "@/config";

export class HttpService extends ExternalApiService {
  /**
   * Expose methods for authenticated agent to call external API.
   */
  public get authedAgentApi() {
    this.tokenService = new CasinoTokenService();
    return this.authedApi;
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

  /**
   * API for fetching Alquimia's API manager token
   */
  public get plainAlquimiaApi() {
    return axios.create({
      baseURL: CONFIG.EXTERNAL.ALQ_BASE_URL,
      validateStatus: () => true,
    });
  }

  /**
   * API for fetching Alquimia's Alquimia token
   */
  public get alqTokenApi() {
    return axios.create({
      baseURL: CONFIG.EXTERNAL.ALQ_TOKEN_URL,
      validateStatus: () => true,
    });
  }

  /**
   * API for making authenticated calls to Alquimia
   */
  public get authedAlqApi() {
    this.tokenService = new AlquimiaTokenService();
    return this.authedApi;
  }
}

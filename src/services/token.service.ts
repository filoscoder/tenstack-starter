import { HttpService } from "./http.service";
import { decrypt } from "@/utils/crypt";
import { CustomError } from "@/middlewares/errorHandler";
import { UserRootDAO } from "@/db/user-root";
import CONFIG from "@/config";
import { LoginResponse } from "@/types/response/agent";

export class TokenService {
  private _username = "";
  private _password = "";
  private _encryptedPassword = "";
  private _token?: string;

  public get username() {
    if (this._username) return this._username;

    const encryptedUsername = CONFIG.AUTH.AGENT_USERNAME;
    if (!encryptedUsername) {
      throw new CustomError({
        status: 500,
        code: "env",
        description: "No se encontro el usuario en la variable de entorno",
      });
    }
    this._username = decrypt(encryptedUsername);
    return this._username;
  }

  private get password() {
    if (this._password) return this._password;

    const encryptedPassword = CONFIG.AUTH.AGENT_PASSWORD;
    if (!encryptedPassword) {
      throw new CustomError({
        status: 500,
        code: "env",
        description: "No se encontro la contraseña en la variable de entorno",
      });
    }
    this._password = decrypt(encryptedPassword);
    this._encryptedPassword = encryptedPassword;
    return this._password;
  }

  private get encryptedPassword() {
    if (this._encryptedPassword) return this._encryptedPassword;

    this.password;
    return this._encryptedPassword;
  }

  private get loginDetails() {
    return {
      username: this.username,
      password: this.password,
    };
  }

  /**
   * Get access token from memory, DB or refresh
   * @returns access token if available and valid, null if not available
   * or expired
   */
  async token(): Promise<string | null> {
    return (await this.cachedToken()) || (await this.refreshToken());
  }

  private async cachedToken(): Promise<string | null> {
    if (this._token && this.verifyTokenExpiration(this._token))
      return this._token;

    let agent = null;
    try {
      agent = await UserRootDAO.getAgent();
    } catch (error) {
      return null;
    }

    if (!agent || agent.dirty || !this.verifyTokenExpiration(agent.access)) {
      return null;
    }

    this._token = agent.access;
    return this._token;
  }

  /**
   * Si el refresh token está dentro de su fecha de expiración, se usa para
   * obtener un nuevo access token, sino se reloguea.
   * @returns Agent access token
   */
  async refreshToken(): Promise<string | null> {
    const agent = await UserRootDAO.getAgent();
    if (!agent) return null;

    const isValid = this.verifyTokenExpiration(agent.refresh);
    if (!isValid) return null;
    try {
      const refreshUrl = "/accounts/refresh/";
      const { plainAgentApi } = new HttpService();

      const response = await plainAgentApi({
        url: refreshUrl,
        method: "POST",
        data: { refresh: agent.refresh },
      });

      const access: string = response.data.access;
      if (access) {
        await UserRootDAO.update(this.username, { access });
        return access;
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Log agent in and return access token
   * @returns access token or null if agent login is under way
   */
  async login(): Promise<string | null> {
    const agent = await UserRootDAO.getAgent();
    if (agent && agent.dirty) return null;

    try {
      if (agent) await this.setAgentLoginStatus(true);
      const data = await this.attemptLogin();
      await this.finalizeAgentLogin(data);
      return data.access;
    } catch (error) {
      await this.setAgentLoginStatus(false);
      throw error;
    }
  }

  private async setAgentLoginStatus(isDirty: boolean): Promise<void> {
    await this.setAgentDirtyFlag(isDirty);
  }

  private async attemptLogin(): Promise<LoginResponse> {
    const agentLoginUrl = "/accounts/login/";
    const response = await new HttpService().plainAgentApi.post(
      agentLoginUrl,
      this.loginDetails,
    );

    if (response.status !== 200) {
      throw new CustomError({
        status: response.status,
        code: "server_error",
        description: "Error en el panel al loguear al agente",
      });
    }

    return response.data;
  }

  private async finalizeAgentLogin(data: LoginResponse): Promise<void> {
    await this.upsertAgent(data);
    this._token = data.access;
  }

  /**
   * Verificar si el token está expirado
   * @param token the token to check
   * @returns true for valid token, false for expired token
   */
  private verifyTokenExpiration(token: string): boolean {
    try {
      const bufer = Buffer.from(token.split(".")[1], "base64");
      const payloadJson = bufer.toString("utf8");
      const payload = JSON.parse(payloadJson);
      const currentTimeInSeconds = Math.floor(Date.now() / 1000);

      return !(Number(payload.exp) < currentTimeInSeconds + 10);
    } catch (error) {
      return false;
    }
  }

  private setAgentDirtyFlag(dirty: boolean) {
    if (dirty) this._token = undefined;
    return UserRootDAO.update(this.username, { dirty });
  }

  private upsertAgent(data: LoginResponse) {
    return UserRootDAO.upsert(
      this.username,
      {
        access: data.access,
        refresh: data.refresh,
        json_response: JSON.stringify(data),
        dirty: false,
      },
      {
        username: data.username,
        password: this.encryptedPassword,
        panel_id: data.id,
        access: data.access,
        refresh: data.refresh,
        json_response: JSON.stringify(data),
        dirty: false,
      },
    );
  }
}

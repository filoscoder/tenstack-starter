import { PrismaClient } from "@prisma/client";
import axios from "axios";
import { LoginResponse } from "usuarios";
import { decrypt } from "@/utils/crypt";
import CONFIG from "@/config";
import { CustomError } from "@/middlewares/errorHandler";

export class TokenService {
  private _prisma: PrismaClient;
  private _username = "";
  private _password = "";
  private _encryptedPassword = "";
  private _token?: string;
  private _urlApiExterna = CONFIG.EXTERNAL.AGENT_BASE_URL + "/accounts/login/";

  constructor() {
    this._prisma = new PrismaClient();
  }

  public get username() {
    if (this._username) return this._username;

    const encryptedUsername = process.env["AGENT_USERNAME"];
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

    const encryptedPassword = process.env["AGENT_PASSWORD"];
    if (!encryptedPassword) {
      throw new CustomError({
        status: 500,
        code: "env",
        description: "No se encontro la contraseña en la variable de entorno",
      });
    }
    this._password = decrypt(encryptedPassword);
    return this._password;
  }

  private get encryptedPassword() {
    if (this._encryptedPassword) return this._encryptedPassword;

    const encryptedPassword = process.env["AGENT_PASSWORD"];
    if (!encryptedPassword) {
      throw new CustomError({
        status: 500,
        code: "env",
        description: "No se encontro la contraseña en la variable de entorno",
      });
    }
    this._encryptedPassword = encryptedPassword;
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
    // Si hay token en memoria y está valido, devolverlo.
    if (this._token && this.verifyTokenExpiration(this._token))
      return this._token;

    // Buscar agente en la bbdd y extraer el access token
    const agent = await this._prisma.userRoot.findFirst({
      where: { username: this.username },
    });

    // No hay token en memoria ni en bbdd
    // O el agente está siendo logueado (tokens inválidos hasta que termine
    // el login)
    if (!agent || agent.dirty) return null;

    if (!this.verifyTokenExpiration(agent.access))
      // Token está expirado
      return null;

    this._token = agent.access;
    return this._token;
  }

  /**
   * Si el refresh token está dentro de su fecha de expiración, se usa para
   * obtener un nuevo access token, sino se reloguea.
   * @returns Agent access token
   */
  async refreshToken(): Promise<string | null> {
    const refreshUrl = CONFIG.EXTERNAL.AGENT_BASE_URL + "/accounts/refresh/";
    const agent = await this._prisma.userRoot.findFirst();
    if (!agent) return null;

    const isValid = this.verifyTokenExpiration(agent.refresh);
    if (!isValid) return null;

    // Conseguir un access token nuevo
    const response = await axios({
      url: refreshUrl,
      method: "POST",
      data: { refresh: agent.refresh },
      validateStatus: () => true,
    });

    const access = response.data.access;
    if (access) {
      // Actualizar agente
      await this._prisma.userRoot.update({
        where: { username: this.username },
        data: { access },
      });
      return access;
    }
    // Refresh token invalido, neceistamos reloguear
    else return null;
  }

  /**
   * Log agent in and return access token
   * @returns access token or null if agent login is under way
   */
  async login(): Promise<string | null> {
    const agent = await this._prisma.userRoot.findFirst();
    // El agente está siendo logueado
    if (agent && agent.dirty) return null;

    // Indicar que estamos logueando al agente
    if (agent) await this.setAgentDirtyFlag(true);

    const response = await axios.post(this._urlApiExterna, this.loginDetails, {
      validateStatus: () => true,
    });

    if (response.status !== 200) {
      await this.setAgentDirtyFlag(false);

      throw new CustomError({
        status: response.status,
        code: "server_error",
        description: "Error en el panel al loguear al agente",
      });
    }

    const data: LoginResponse = response.data;
    await this.upsertAgent(data);

    this._token = data.access;
    return data.access;
  }

  /**
   * Verificar si el token está expirado
   * @param token the token to check
   * @returns true for valid token, false for expired token
   */
  private verifyTokenExpiration(token: string): boolean {
    // Decodificar token
    const payloadJson = atob(token.split(".")[1]);
    const payload = JSON.parse(payloadJson);

    // Chequear si el token está expirado
    // Nos damos 10 segundos de margen
    return !(Number(payload.exp) - 10 < Math.floor(Date.now() / 1000));
  }

  private setAgentDirtyFlag(dirty: boolean) {
    if (dirty) this._token = undefined;
    return this._prisma.userRoot.update({
      where: { username: this.username },
      data: { dirty },
    });
  }

  private upsertAgent(data: LoginResponse) {
    return this._prisma.userRoot.upsert({
      // If user exists
      where: { username: this.username },
      // Update following fields
      update: {
        access: data.access,
        refresh: data.refresh,
        json_response: JSON.stringify(data),
        dirty: false,
      },
      // Else create new entry
      create: {
        username: data.username,
        password: this.encryptedPassword,
        panel_id: data.id,
        access: data.access,
        refresh: data.refresh,
        json_response: JSON.stringify(data),
        dirty: false,
      },
    });
  }
}

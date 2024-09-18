import { ErrorData } from "@/types/response/error";

export const ERR: { [key: string]: ErrorData } = {
  USER_ALREADY_EXISTS: {
    status: 400,
    code: "ya_existe",
    description: "Este nombre de usuario ya está en uso. Elige otro.",
  },
  INVALID_CREDENTIALS: {
    status: 400,
    code: "credenciales_invalidas",
    description: "Usuario o contraseña incorrectos",
  },
  AGENT_LOGIN: {
    status: 500,
    code: "agent_login",
    description: "Error al loguear el agente en el panel",
  },
  EXTERNAL_LOGIN: {
    status: 500,
    code: "external_login",
    description: "Error en login externo",
  },
  TOKEN_EXPIRED: {
    status: 401,
    code: "token_expirado",
    description: "Token expirado",
  },
  TOKEN_INVALID: {
    status: 401,
    code: "token_invalido",
    description: "Token invalido",
  },
  TOKEN_REVOKED: {
    status: 401,
    code: "double_token_usage",
    description: "Token invalido",
  },
  WRONG_TOKEN_TYPE: {
    status: 401,
    code: "wrong_token_type",
    description: "Token invalido",
  },
  KEY_NOT_FOUND: {
    status: 500,
    code: "env",
    description: "No se encontro la llave en .env",
  },
  AGENT_PASS_NOT_SET: {
    status: 500,
    code: "env",
    description: "No se encontro la clave de agente en .env",
  },
  AGENT_UNSET: {
    status: 500,
    code: "agent_unset",
    description: "No se encontro el agente en la BD. ¿Corriste npm run seed?",
  },
  ALQ_URL_NOT_FOUND: {
    status: 500,
    code: "env",
    description: "No se encontro la url de Alquimia en .env",
  },
  ALQ_AUTH_NOT_FOUND: {
    status: 500,
    code: "env",
    description:
      "No se encontro la clave de autenticacion de Alquimia en .env (Basic auth)",
  },
  ALQ_TOKEN_ERROR: {
    status: 500,
    code: "alquimia",
    description: "Error en Alquimia al obtener token.",
  },
  ALQ_ACCOUNT_NOT_FOUND: {
    status: 404,
    code: "alquimia",
    description: "Alquimia account not found",
  },
  TRANSACTION_LOG: {
    status: 500,
    code: "transaction_log",
    description: "Error al loguear transaccion",
  },
  TOO_MANY_REQUESTS: {
    status: 429,
    code: "too_many_requests",
    description: "Demasiadas solicitudes",
  },
  COIN_TRANSFER_UNSUCCESSFUL: {
    status: 502,
    code: "bad_gateway",
    description: "No se pudo transferir las fichas.",
  },
  INSUFICIENT_BALANCE: {
    status: 400,
    code: "insuficient_balance",
    description: "Saldo insuficiente",
  },
  AGENT_BANK_ACCOUNT_UNSET: {
    status: 500,
    code: "agent_bank_account_unset",
    description: "No se encontro la cuenta bancaria del agente en la BD.",
  },
  CASHOUT_UNAVAILABLE: {
    status: 400,
    code: "cashout_unavailable",
    description: "No hay saldo disponible",
  },
  BOT_API_ERROR: {
    status: 500,
    code: "bot_api_error",
    description: "Error en la api interna del bot",
  },
};

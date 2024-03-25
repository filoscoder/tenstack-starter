import pkg from "../../package.json";

// https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
// eslint-disable-next-line @typescript-eslint/no-var-requires
require("dotenv").config();

const CONFIG = {
  APP: {
    NAME: pkg.name,
    VERSION: pkg.version,
    VER: `v${pkg.version[0][0]}`,
    DESCRIPTION: pkg.description,
    AUTHORS: pkg.authors,
    HOST: process.env.APP_HOST,
    BASE_URL: process.env.API_BASE_URL,
    PORT: process.env.NODE_ENV === "test" ? 8888 : process.env.PORT || 8080,
    ENV: process.env.NODE_ENV,
    CYPHER_PASS: process.env.CYPHER_PASS,
  },
  SERVER: {
    TIMEOUT: 60000, // 1m
  },
  LOG: {
    PATH: process.env.LOGGING_DIR || "logs",
    LEVEL: process.env.LOGGING_LEVEL || "info",
    MAX_FILES: process.env.LOGGING_MAX_FILES || 5,
  },
  AUTH: {
    SALT_ROUNDS: process.env.SALT_ROUNDS || "11",
    ACCESS_TOKEN_EXPIRE: process.env.ACCESS_TOKEN_DURATION || "300000",
    REFRESH_TOKEN_EXPIRE: process.env.REFRESH_TOKEN_DURATION || "86400000",
    ACCESS_TOKEN_SALT: process.env.ACCESS_TOKEN_SALT,
    REFRESH_TOKEN_SALT: process.env.REFRESH_TOKEN_SALT,
    WEB_PUSH_PUBLIC_KEY: process.env.WEB_PUSH_PUBLIC_KEY,
    WEB_PUSH_PRIVATE_KEY: process.env.WEB_PUSH_PRIVATE_KEY,
    ALQUIMIA_BASIC_AUTH: process.env.ALQUIMIA_BASIC_AUTH,
    ALQUIMIA_USERNAME: process.env.ALQUIMIA_USERNAME,
    ALQUIMIA_PASSWORD: process.env.ALQUIMIA_PASSWORD,
  },
  AWS: {
    ACCESS_KEY: process.env.AWS_ACCESS_KEY,
    SECRET_KEY: process.env.AWS_SECRET_KEY,
    REGION: process.env.AWS_REGION,
    S3: {
      PATH: process.env.S3_BUCKET_PATH,
      BUCKET_NAME: process.env.S3_BUCKET_NAME,
    },
    COGNITO: {
      USER_POOL_ID: process.env.COGNITO_USER_POOL_ID,
      CLIENT_ID: process.env.COGNITO_CLIENT_ID,
    },
  },
  EXTERNAL: {
    API_KEY: process.env.API_KEY,
    AGENT_BASE_URL: process.env.AGENT_API_BASE_URL,
    PLAYER_BASE_URL: process.env.PLAYER_API_BASE_URL,
    ALQ_BASE_URL: process.env.ALQ_BASE_URL,
    ALQ_API_VERSION: process.env.ALQ_API_VERSION,
    ALQ_TOKEN_URL: process.env.ALQ_TOKEN_URL,
    ALQ_SAVINGS_ACCOUNT_ID: process.env.ALQ_SAVINGS_ACCOUNT_ID,
  },
  ROLES: {
    AGENT: "agent",
    PLAYER: "player",
  },
  /** Static Details */
  SD: {
    INSUFICIENT_BALANCE: "Saldo insuficiente",
    INSUFICIENT_CREDITS: "FichasInsuficientes",
    DEPOSIT_STATUS: {
      /** Created by user, pending confirmation at alquimia */
      PENDING: "pending",
      /** Not found at alquimia */
      REJECTED: "rejected",
      /** Allisgood */
      CONFIRMED: "confirmed",
      /** Cancelled by user */
      CANCELED: "cancelled",
      /** Deleted by agent */
      DELETED: "deleted",
    },
    COIN_TRANSFER_STATUS: {
      COMPLETED: "COMPLETED",
      INCOMPLETE: "INCOMPLETE",
    },
  },
} as const;

export default CONFIG;

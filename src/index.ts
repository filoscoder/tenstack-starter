/* eslint-disable @typescript-eslint/no-var-requires */
// ! Don't convert require into import
require("module-alias").addAlias("@", __dirname);
import { createApp } from "./app";
import { startServer } from "./server";
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

const env = process.env.NODE_ENV || "development";
const envRootPath =
  env === "development" ? `../.env.${env}` : `../../.env.${env}`;
const envFilePath = path.resolve(__dirname, envRootPath);

if (fs.existsSync(envFilePath)) {
  dotenv.config({ path: envFilePath });
} else {
  console.error(
    `Archivo de configuración (${__dirname}) .env para el entorno '${env}' no encontrado.`,
  );
  process.exit(1);
}

// if (process.env.NODE_ENV === "production") {
//   startWhatsappBot();
// }

const app = createApp();
startServer(app);

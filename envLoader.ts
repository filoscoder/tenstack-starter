const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

const env = process.env.NODE_ENV || "development";
const envRootPath =
  env === "development" ? "./.env" : "../.env";
const envFilePath = path.resolve(__dirname, `${envRootPath}.${env}`);
const rootEnvFilePath = path.resolve(__dirname, `${envRootPath}`);


if (fs.existsSync(envFilePath)) {
  fs.copyFileSync(envFilePath, rootEnvFilePath);
  dotenv.config({ path: envFilePath });
} else {
  console.error(
    `Archivo de configuración (${envFilePath}) .env para el entorno '${env}' no encontrado.`,
  );
  process.exit(1);
}

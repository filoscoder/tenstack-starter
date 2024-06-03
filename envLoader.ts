const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

const env = process.env.NODE_ENV || "development";
const envRootPath =
  env === "development" ? "./.env" : "../.env";
const envFilePath = path.resolve(__dirname, `${envRootPath}.${env}`);
const rootEnvFilePath = path.resolve(__dirname, `${envRootPath}`);


if (fs.existsSync(envFilePath)) {
  const fs = require('fs');

  fs.copyFileSync(envFilePath, rootEnvFilePath, fs.constants.COPYFILE_FICLONE, { mode: 0o644 });
  dotenv.config({ path: envFilePath });
} else {
  console.error(
    `Archivo de configuración (${envFilePath}) .env para el entorno '${env}' no encontrado.`,
  );
  process.exit(1);
}

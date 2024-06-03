const { execSync } = require('child_process');
const files = require("fs");
const paths = require("path");

const envTarget = process.env.NODE_ENV || "development";
const envTargetFile = paths.resolve(__dirname, `./.env.${envTarget}`);
const rootEnvFile = paths.resolve(__dirname, "./env");

if (files.existsSync(envTargetFile)) {
  files.copyFileSync(envTargetFile, rootEnvFile);
} else {
  console.error(`Archivo de configuración .env para el entorno '${envTarget}' no encontrado en la ruta ${envTargetFile}`);
  process.exit(1);
}

try {
  execSync('npx prisma generate', { stdio: 'inherit' });
} catch (error) {
  console.error('Error ejecutando npx prisma generate:', error);
  process.exit(1);
}

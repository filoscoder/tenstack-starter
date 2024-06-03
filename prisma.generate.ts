const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const dotenv = require('dotenv');

const env = process.env.NODE_ENV || "development";
const envFilePath = path.resolve(__dirname, `.env.${env}`);

if (fs.existsSync(envFilePath)) {
  dotenv.config({ path: envFilePath });
  console.log(`Archivo de configuración ${envFilePath} cargado para el entorno ${env}`);
} else {
  console.error(`Archivo de configuración .env para el entorno '${env}' no encontrado en la ruta ${envFilePath}`);
  process.exit(1);
}

try {
  execSync('npx prisma generate', { stdio: 'inherit' });
} catch (error) {
  console.error('Error ejecutando npx prisma generate:', error);
  process.exit(1);
}

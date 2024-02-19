import { Server, createServer } from "http";
import e from "express";
import { exitLog } from "./helpers";
import CONFIG from "./config";
import BotWhatsapp from '@bot-whatsapp/bot';
import MockAdapter from '@bot-whatsapp/database/mock';
import ProviderWS from '@bot-whatsapp/provider/baileys';
// import flows from "./chatbot/flows";


export const startServer = (app: e.Application): Server => {
  const httpServer = createServer(app);

  process
    .on("SIGINT", () => exitLog(null, "SIGINT"))
    .on("SIGQUIT", () => exitLog(null, "SIGQUIT"))
    .on("SIGTERM", () => exitLog(null, "SIGTERM"))
    .on("uncaughtException", (err) => exitLog(err, "uncaughtException"))
    .on("beforeExit", () => exitLog(null, "beforeExit"))
    .on("exit", () => exitLog(null, "exit"));

  return httpServer.listen({ port: CONFIG.APP.PORT }, (): void => {
    process.stdout.write(`⚙️ Application Environment: ${CONFIG.APP.ENV}\n`);
    process.stdout.write(`⏱ Started on: ${Date.now()}\n`);
    process.stdout.write(
      `Timba Api Server ready at http://localhost:${CONFIG.APP.PORT}\n`,
    );
  });
};

export const startWhatsappBot = async () => {
  const database = new MockAdapter();
  const provider = BotWhatsapp.createProvider(ProviderWS);
  const helloFlow = BotWhatsapp.addKeyword(['hola', 'buenas'])
  .addAnswer('Un gusto tenerte de nuevo ¿Como puedo ayudarte el día de hoy 😀?')

  const flow = BotWhatsapp.createFlow([helloFlow]);
  await BotWhatsapp.createBot({
    database,
    provider,
    flow: flow
  })
}


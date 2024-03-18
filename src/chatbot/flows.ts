import { addKeyword, EVENTS, IMethodsChain } from "@bot-whatsapp/bot";
import { PrismaClient } from "@prisma/client";
import BotWhatsapp from "@bot-whatsapp/bot";

export async function createFlow() {
  const prisma = new PrismaClient();

  const botData = await prisma.botMessages.findFirst();
  if (!botData) return;

  const botMessages = botData.messages as string[][][];
  const botMenus = botData.menus as string[][];

  const resetBotIdleTimeout = async (
    state: any,
    gotoFlow: (flow: any) => Promise<void>,
  ) => {
    const IDLE_TIMEOUT = 300000;
    let timeoutId = state.getMyState()?.timeoutId;
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => gotoFlow(timeoutFlow), IDLE_TIMEOUT);
    await state.update({ timeoutId });
  };

  const clearBotIdleTimeout = (state: any) => {
    const timeoutId = state.getMyState()?.timeoutId;
    clearTimeout(timeoutId);
  };

  const submenuOptionHandler = (answers: string[][], ctx: any, cbArgs: any) => {
    const { flowDynamic, fallBack, gotoFlow, state } = cbArgs;
    clearBotIdleTimeout(state);
    const choice = Math.round(Number(ctx.body.trim()));

    if (choice === answers.length + 1) gotoFlow(mainMenuFlow);
    else if (choice > 0 && choice <= answers.length)
      flowDynamic(answers[choice - 1].join("\n"));
    else {
      resetBotIdleTimeout(state, gotoFlow);
      fallBack("Opción inválida. Intenta de nuevo.");
    }
  };

  const createSubMenu = (menu: string[], answers: string[][]) => {
    return addKeyword(EVENTS.ACTION).addAnswer(
      menu,
      {
        capture: true,
      },
      (ctx, cbArgs) => submenuOptionHandler(answers, ctx, cbArgs),
    );
  };

  const submenus: IMethodsChain[] = [];

  for (let i = 1; i < botMenus.length; i++) {
    const flow = createSubMenu(botMenus[i], botMessages[i]);
    submenus.push(flow);
  }

  let welcomeFlow: IMethodsChain = addKeyword(EVENTS.WELCOME);
  const welcomeMessages = botMessages[0];
  if (welcomeMessages.length > 1) {
    for (let i = 0; i <= welcomeMessages.length - 2; i++) {
      welcomeFlow = welcomeFlow.addAnswer(welcomeMessages[i]);
    }
  }
  welcomeFlow = welcomeFlow.addAnswer(
    welcomeMessages.at(-1) as string[],
    {},
    async (_ctx, { gotoFlow, state }) => {
      await resetBotIdleTimeout(state, gotoFlow);
      await gotoFlow(mainMenuFlow);
    },
  );

  const mainMenuFlow: IMethodsChain = addKeyword("menu")
    .addAnswer(botMenus[0])
    .addAction(
      { capture: true },
      async (ctx, { gotoFlow, fallBack, state }) => {
        const mainMenuOptions = botMenus[0].filter((option) =>
          /\*\d+/.test(option),
        );

        const choice = Math.round(Number(ctx.body.trim()));

        if (choice > 0 && choice <= mainMenuOptions.length) {
          await gotoFlow(submenus[choice - 1]);
        } else fallBack("Opción inválida. Intenta de nuevo.");
        await resetBotIdleTimeout(state, gotoFlow);
      },
    );

  const timeoutFlow: IMethodsChain = addKeyword(EVENTS.ACTION).addAnswer([
    "He cerrado tu sesión por inactividad.",
    'Para volver al menú principal escribe "menu"',
  ]);

  return BotWhatsapp.createFlow([
    welcomeFlow,
    mainMenuFlow,
    ...submenus,
    timeoutFlow,
  ]);
}

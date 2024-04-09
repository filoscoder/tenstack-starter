import { addKeyword, EVENTS, IMethodsChain } from "@bot-whatsapp/bot";
import { BotFlow, PrismaClient } from "@prisma/client";
import BotWhatsapp from "@bot-whatsapp/bot";
import { BotFlowsDAO } from "@/db/bot-flows";

export async function createFlow() {
  const prisma = new PrismaClient();

  const botData = await prisma.botFlow.findMany();

  if (!botData) return;

  const regularFlow = botData.find((flow: BotFlow) => flow.on_call === false);
  const onCallFlow = botData.find((flow: BotFlow) => flow.on_call === true);

  if (!regularFlow || !onCallFlow) return;

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
  const onCallSubmenus: IMethodsChain[] = [];

  for (let i = 1; i < (regularFlow.menus as string[][]).length; i++) {
    // @ts-ignore
    const flow = createSubMenu(regularFlow.menus[i], regularFlow.messages[i]);
    submenus.push(flow);
  }
  for (let i = 1; i < (onCallFlow.menus as string[][][]).length; i++) {
    // @ts-ignore
    const flow = createSubMenu(onCallFlow.menus[i], onCallFlow.messages[i]);
    onCallSubmenus.push(flow);
  }

  let welcomeFlow: IMethodsChain = addKeyword(EVENTS.WELCOME);
  // @ts-ignore
  const welcomeMessages = regularFlow.messages[0] as string[][];
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
    .addAction(async (_ctx, { flowDynamic }) => {
      const weAreOnCall = await BotFlowsDAO.findOnCallFlow();
      // @ts-ignore
      const mainMenu = weAreOnCall ? onCallFlow.menus[0] : regularFlow.menus[0];
      await flowDynamic(mainMenu.join("\n"));
    })
    .addAction(
      { capture: true },
      async (ctx, { gotoFlow, fallBack, state }) => {
        const weAreOnCall = await BotFlowsDAO.findOnCallFlow();
        // @ts-ignore
        const menus = (
          weAreOnCall ? onCallFlow.menus : regularFlow.menus
        ) as string[][];
        const mainMenuOptions = menus[0].filter((option) =>
          /\*\d+/.test(option),
        );
        const subflows = weAreOnCall ? onCallSubmenus : submenus;

        const choice = Math.round(Number(ctx.body.trim()));

        if (choice > 0 && choice <= mainMenuOptions.length) {
          await gotoFlow(subflows[choice - 1]);
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
    ...onCallSubmenus,
    timeoutFlow,
  ]);
}

import pino from "pino";
import CONFIG from "@/config";

const token = CONFIG.AUTH.LOGTAIL_TOKEN;
const transport = pino.transport({
  target: "@logtail/pino",
  options: { sourceToken: token },
});
/**
 * Log errors into logtail
 */
export const logtailLogger = pino(transport);

export const exitLog = (err: any, evt: string) => {
  if (err) {
    process.stdout.write(`\n\n[!ERROR][${evt}] => ${err}\n\n`);
    console.error(err);
  } else {
    process.stdout.write(`\n\n![${evt}] EVENT CAUSE EXIT\n\n`);
  }

  process.exit(err ? 1 : 0);
};

// ! Don't convert require into import
// eslint-disable-next-line @typescript-eslint/no-var-requires
require("module-alias").addAlias("@", __dirname);

import { createApp } from "./app";
import { startServer } from "./server";

if (process.env.NODE_ENV !== "test") {
  const app = createApp();
  startServer(app);
}

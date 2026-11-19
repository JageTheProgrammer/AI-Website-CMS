import { validateEnv } from "./lib/env";
import { app } from "./src/app";

validateEnv();
export default app;
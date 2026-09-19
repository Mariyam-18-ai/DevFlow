import { createApp } from "./app.js";
import { env } from "./config/env.js";

const app = createApp();

app.listen(env.PORT, "0.0.0.0", () => {
  console.log(`Backend server running on port ${env.PORT} [${env.NODE_ENV}]`);
});

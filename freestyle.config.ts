import { defineConfig } from "freestyle-sh";
import dotenv from "dotenv";

dotenv.config();

export default defineConfig({
  deploy: {
    cloudstate: {
      envVars: {
        ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
      },
    },
  },
});

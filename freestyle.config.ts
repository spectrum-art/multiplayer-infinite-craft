import { defineConfig } from "freestyle-sh";
import dotenv from "dotenv";

dotenv.config();

export default defineConfig({
  deploy: {
    cloudstate: {
      envVars: {
       OLLAMA_MODEL_NAME: process.env.OLLAMA_MODEL_NAME,
      },
    },
  },
});

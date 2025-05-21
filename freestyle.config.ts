import { defineConfig } from "freestyle-sh";
import dotenv from "dotenv";

dotenv.config();

export default defineConfig({
  deploy: {
    cloudstate: {
      envVars: {
        OLLAMA_MODEL_NAME: "phi3:mini",
        OLLAMA_HOST: "http://localhost:11434"
      },
    },
  },
});
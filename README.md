# Multiplayer Infinite Craft

A multiplayer version of Infinite Craft built with Astro/React frontend and **[Freestyle](https://freestyle.sh)** backend: full stack pure TypeScript. LLM prompt included.

> [!NOTE]
> Want to deploy your own version? Jump [here](#deployment).

> [!TIP]
> To put together the game yourself, and learn Freestyle in the process, I recommend following the official [tutorial](https://blog.freestyle.dev/posts/multiplayer-infinite-craft).

## About

This project is a multiplayer adaptation of the popular Infinite Craft game, allowing players to collaboratively discover new elements in shared rooms in real-time. It demonstrates full-stack TypeScript development using **[Freestyle](https://freestyle.sh)** for seamless cloud integration and local LLM inference via Ollama.

![client-game-craft-noun](https://github.com/kevgug/multiplayer-infinite-craft/assets/37193648/bd752979-d914-427e-8c35-08c9ff105a60)

## Play Now

You can play the finished game at [https://infinitecraft.freestyle.dev](https://infinitecraft.freestyle.dev) or [deploy](#deployment) your own version.

Create a room and invite friends to play together!

## Features

- Multiplayer rooms with real-time updates
- Generative AI for creating new elements (local LLM via Ollama)
- Full-stack TypeScript implementation
- Cloud-based data persistence using [Freestyle](https://freestyle.sh)

## Installation

1. Clone this repository
2. Install dependencies: `npm install`
3. Install and run [Ollama](https://ollama.com/) locally (see below)
4. Run the development server: `npx freestyle dev`

### Ollama Setup

- Download and install Ollama from [https://ollama.com/](https://ollama.com/)
- Pull a supported model (e.g. `ollama pull phi3:mini`)
- Ensure Ollama is running locally (default: `http://localhost:11434`)
- You can change the model in `.env` or `freestyle.config.ts` if desired

## Deployment

To deploy your own instance of the game:

1. Ensure your deployment environment can access a running Ollama server (local or remote)
2. Login to Freestyle: `npx freestyle login`
3. Build the project: `npx freestyle build`
4. Deploy: `npx freestyle deploy`
5. Follow the prompts to choose a subdomain for your game

> **Note:** Anthropic and other cloud-based LLMs are no longer supported. All inference is performed locally via Ollama.

## Tutorial

This project was created as part of a tutorial on the Freestyle blog. For a detailed walkthrough of how this game was built, including explanations of key concepts and implementation details, check out the [full tutorial](https://blog.freestyle.dev/posts/multiplayer-infinite-craft).

## License

This project is open source and available under the [MIT License](LICENSE).

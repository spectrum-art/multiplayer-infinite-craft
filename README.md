# Multiplayer Infinite Craft

A multiplayer version of Infinite Craft built with TypeScript, Astro, React, and **[Freestyle](https://freestyle.sh)**.

> [!NOTE]
> Want to deploy your own version? Jump [here](#deployment).

## About

This project is a multiplayer adaptation of the popular Infinite Craft game, allowing players to collaboratively discover new elements in shared rooms. It demonstrates full-stack TypeScript development using **[Freestyle](https://freestyle.sh)** for seamless cloud integration.

![client-game-craft-noun](https://github.com/kevgug/multiplayer-infinite-craft/assets/37193648/bd752979-d914-427e-8c35-08c9ff105a60)

## Play Now

You can play the finished game at [https://infinitecraft.freestyle.dev](https://infinitecraft.freestyle.dev) or [deploy](#deployment) your own version.

Create a room and invite friends to play together!

## Features

- Multiplayer rooms with real-time updates
- Generative AI for creating new elements
- Full-stack TypeScript implementation
- Cloud-based data persistence using Freestyle

## Installation

1. Clone this repository
2. Install dependencies: `npm install`
3. Set up your Anthropic API key as described in the [tutorial](https://blog.freestyle.dev/posts/multiplayer-infinite-craft#setup)
4. Run the development server: `npx freestyle dev`

## Deployment

To deploy your own instance of the game:

1. Save your Anthropic API key in a `.env` file at the root of the project as `ANTHROPIC_API_KEY`
2. Login to Freestyle: `npx freestyle login`
3. Build the project: `npx freestyle build`
4. Deploy: `npx freestyle deploy`
5. Follow the prompts to choose a subdomain for your game

For instructions on generating an Anthropic API key, refer to the [Setup](https://blog.freestyle.dev/posts/multiplayer-infinite-craft#setup) section of the tutorial. For detailed deployment instructions, refer to the [Deploying to the Cloud](https://blog.freestyle.dev/posts/multiplayer-infinite-craft#deploying-to-the-cloud) section of the tutorial.

## Tutorial

This project was created as part of a tutorial on the Freestyle blog. For a detailed walkthrough of how this game was built, including explanations of key concepts and implementation details, check out the [full tutorial](https://blog.freestyle.dev/posts/multiplayer-infinite-craft).

## License

This project is open source and available under the [MIT License](LICENSE).

import type { Message } from "@anthropic-ai/sdk/resources/index.mjs";

export const getFirstText = (message: Message): string => {
	return (message.content[0] as any).text;
}

import { cloudstate, useLocal } from "freestyle-sh";
import { EmojiNoun, EmojiNounRes, EmojiNounChoices } from "./noun";
import { NounManagerCS } from "./nounManager";
import Prompts from "../prompts/prompts";
import { getFirstEmoji } from "../helpers/emoji-strings";
import { parseModelOutput } from '../helpers/parsing';

@cloudstate
export class RoomCS {
	id: string;
	constructor(id: string) { this.id = id; }
	nouns: EmojiNoun[] = EmojiNoun.STARTING_NOUNS;
	getNouns() { return this.nouns; }
	async craftNoun(a: EmojiNoun, b: EmojiNoun): Promise<EmojiNounRes> {
		const comboKey = EmojiNoun.createKey(a, b);
		const nounManager = useLocal(NounManagerCS);
		let outputNoun = nounManager.didTryCombo(comboKey)
			? { ...nounManager.getNoun(comboKey), discovered: false }
			: await RoomCS._generateNoun(comboKey);
		if (!nounManager.didTryCombo(comboKey)) {
			outputNoun.discovered = !nounManager.hasNoun(outputNoun);
			nounManager.addKeyAndNoun(comboKey, outputNoun);
		}
		const isNewToRoom = !this.nouns.some(n => n.text === outputNoun.text);
		if (isNewToRoom) this.nouns.push({ ...outputNoun });
		return { ...outputNoun, isNewToRoom };
	}
	static async _generateNoun(comboKey: string): Promise<EmojiNoun> {
		const res = await fetch(
			`${process.env.OLLAMA_HOST || "http://localhost:11434"}/v1/chat/completions`,
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					model: process.env.OLLAMA_MODEL_NAME,
					messages: [
						{ role: "system", content: Prompts.GENERATE_NEW_NOUN },
						{ role: "user", content: comboKey },
					],
					stream: false,
				}),
			}
		);
		if (!res.ok) throw new Error(`Ollama server error: ${res.status} ${res.statusText}. Is Ollama running at ${process.env.OLLAMA_HOST || "http://localhost:11434"}?`);
		const data = await res.json();
		if (!data.choices?.[0]?.message?.content) throw new Error(`Unexpected Ollama response: ${JSON.stringify(data)}`);
		const raw = data.choices[0].message.content;
		console.log('OLLAMA RAW OUTPUT:', raw); // Debug: log the raw LLM output
		const parsed = parseModelOutput(raw);
		const { obvious, witty } = EmojiNounChoices.fromJson(parsed);
		const noun = Math.random() < EmojiNounChoices.WITTY_THRESHOLD ? obvious : witty;
		noun.emoji = getFirstEmoji(noun.emoji);
		return noun;
	}
}

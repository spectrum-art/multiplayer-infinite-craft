import { cloudstate, useLocal } from "freestyle-sh";
import { EmojiNoun, EmojiNounRes, EmojiNounChoices } from "./noun";
import { NounManagerCS } from "./nounManager";

import Prompts from "../prompts/prompts";
import { getFirstEmoji } from "../helpers/emoji-strings";

@cloudstate
export class RoomCS {
	id: string;
	constructor(id: string) {
		this.id = id;
	}

	nouns: EmojiNoun[] = EmojiNoun.STARTING_NOUNS;
	getNouns(): EmojiNoun[] {
		return this.nouns;
	}
	async craftNoun(a: EmojiNoun, b: EmojiNoun): Promise<EmojiNounRes> {
		let outputNoun: EmojiNoun;
		let isNewToRoom: boolean;

		const comboKey = EmojiNoun.createKey(a, b);
		const nounManager = useLocal(NounManagerCS);

		if (nounManager.didTryCombo(comboKey)) {			
			// Take combo from global cache
			outputNoun = nounManager.getNoun(comboKey);
			outputNoun.discovered = false;
		} else {
			// Generate a new noun
			outputNoun = await RoomCS._generateNoun(comboKey);
			
			// Check if noun is a discovery to all rooms
			outputNoun.discovered = !nounManager.hasNoun(outputNoun);

			// Add noun to global cache
			nounManager.addKeyAndNoun(comboKey, outputNoun);
		}

		// Check if noun is new to room
		isNewToRoom = !this.nouns.some(noun => noun.text === outputNoun.text);
		if (isNewToRoom) {
			// Add new noun to room
			this.nouns.push(outputNoun);
		}

		// Response payload
		return {...outputNoun, isNewToRoom: isNewToRoom};
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
		        { role: "user",   content: comboKey },
		      ],
		      stream: false,
		    }),
		  }
		);
		const { choices } = await res.json();
		const raw = choices[0].message.content;
		console.log("OLLAMA raw:", raw);
		const text = raw.trim();
		const match = text.match(/(\[[\s\S]*\]|\{[\s\S]*\})/);
		let jsonText = match ? match[1] : text;
		try {
			//first attempt
			var parsed = JSON.parse(jsonText);
		} catch {
			// quick-fix common typos
			jsonText = jsonText.replace(/"emoji"\s*:\s*":/g, '"emoji":"');
			parsed = JSON.parse(jsonText);
		}
		const nounChoices = EmojiNounChoices.fromJson(parsed);
		const noun = Math.random() < EmojiNounChoices.WITTY_THRESHOLD ? nounChoices.obvious : nounChoices.witty;
		
		// Ensure a single emoji
		noun.emoji = getFirstEmoji(noun.emoji);

		return noun;
	}
}

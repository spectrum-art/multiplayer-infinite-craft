import { cloudstate, useLocal } from "freestyle-sh";
import { EmojiNoun, EmojiNounRes } from "./noun";

import Anthropic from "@anthropic-ai/sdk";
import Prompts from "../prompts/prompts";
import { getFirstText } from "../helpers/anthropic-msg";
import { getFirstEmoji } from "../helpers/emoji-strings";
import { NounManagerCS } from "./nounManager";

@cloudstate
export class RoomCS {
	id = crypto.randomUUID();
	getId(): string {
		return this.id;
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
			// Generate noun choices and choose one randomly
			const nounChoices = await RoomCS._generateNounChoices(comboKey);
			outputNoun = Math.random() < NounChoices.WITTY_THRESHOLD ? nounChoices.obvious : nounChoices.witty;
			outputNoun.emoji = getFirstEmoji(outputNoun.emoji);

			// Check if noun is new to global cache
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

	// LLM prompting
	static _generateNounChoices = async (comboKey: string): Promise<NounChoices> => {
		const nounChoicesMsg = await new Anthropic().messages.create({
			model: 'claude-3-haiku-20240307',
			max_tokens: 200,
			temperature: 0.5,
			system: Prompts.GENERATE_NEW_NOUN,
			messages: [{'role': 'user','content': [{'type': 'text','text': comboKey}]}],
		});
		return NounChoices.fromJson(JSON.parse(getFirstText(nounChoicesMsg)));
	}
}

class NounChoices {
	obvious: EmojiNoun = new EmojiNoun();
	witty: EmojiNoun = new EmojiNoun();
	static fromJson(json: any): NounChoices {
		return {
			obvious: json.obvious_choice,
			witty: json.witty_choice,
		}
	}
	static WITTY_THRESHOLD = 0.7;
}
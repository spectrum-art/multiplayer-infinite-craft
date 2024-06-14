import { cloudstate } from "freestyle-sh";
import { EmojiNoun, EmojiNounRes } from "./emoji-noun";
import { getFirstEmoji } from "../helpers/emoji-strings";

import Anthropic from "@anthropic-ai/sdk";
import type { Message } from "@anthropic-ai/sdk/resources/messages.mjs";
import Prompts from "../prompts/prompts";

let anthropic = new Anthropic();

interface NounChoices {
	obvious_choice: string;
	exciting_choice: string;
}

@cloudstate
export class InfiniteCraftState {
	static id = "infinite-craft" as const;

	nounMap: Map<string, EmojiNoun> = new Map();
	nouns: EmojiNoun[] = [
		{text: 'Water', emoji: '💧'},
		{text: 'Fire', emoji: '🔥'},
		{text: 'Wind', emoji: '🌬️'},
		{text: 'Earth', emoji: '🌍'},
	];

	updateLlmApiKey(apiKey: string) {
		process.env.ANTHROPIC_API_KEY = apiKey;
		anthropic = new Anthropic();
	}

	async craftNoun(a: EmojiNoun, b: EmojiNoun): Promise<EmojiNounRes> {
		// Order nouns alphabetically, for consistent keying
		if (a.text > b.text) {
			[a, b] = [b, a];
		}

		if (this.nounMap.has(EmojiNoun.createKey(a, b))) {
			// Noun already exists
			console.log('Noun already exists in map:', EmojiNoun.createKey(a, b));
			return {...this.nounMap.get(EmojiNoun.createKey(a, b))!, isNew: false};
		}

		// Prompt LLM to generate new noun
		const possibleNounsMsg: Message = await anthropic.messages.create({
			model: 'claude-3-haiku-20240307',
			max_tokens: 200,
			temperature: 0,
			system: Prompts.GENERATE_NEW_NOUN,
			messages: [
				{
					'role': 'user',
					'content': [
						{
							'type': 'text',
							'text': EmojiNoun.createKey(a, b),
						},
					],
				},
			],
		});
		console.log(possibleNounsMsg.content[0]);
		
		// Parse noun options
		const nounChoices: NounChoices = JSON.parse((possibleNounsMsg.content[0] as any).text)
		// Randomly select best noun, with 90% probability for obvious choice
		const bestNoun: string = Math.random() < 0.9 ? nounChoices.obvious_choice : nounChoices.exciting_choice;

		// Check if noun already exists
		const existingNoun: EmojiNoun | undefined = this.nouns.find(noun => noun.text === bestNoun);
		const isNew: boolean = existingNoun === undefined;
		
		let result: EmojiNoun;
		if (isNew) {
			// Prompt LLM to pick best emoji
			const selectedEmojiMsg: Message = await anthropic.messages.create({
				model: 'claude-3-haiku-20240307',
				max_tokens: 200,
				temperature: 0,
				system: Prompts.PICK_BEST_EMOJI,
				messages: [
					{
						'role': 'user',
						'content': [
							{
								'type': 'text',
								'text': bestNoun,
							},
						],
					},
				],
			});

			// Parse best emoji
			console.log(selectedEmojiMsg.content[0])
			const bestEmoji: string = JSON.parse((selectedEmojiMsg.content[0] as any).text)["best_choice"];

			result = {text: bestNoun, emoji: getFirstEmoji(bestEmoji)};
			this.nouns.push(result);
		} else {
			// Noun already exists
			result = existingNoun!;
		}

		// Add `a + b = bestNoun` to the noun map
		this.nounMap.set(EmojiNoun.createKey(a, b), result);
		console.log('Added noun to map:', EmojiNoun.createKey(a, b), result);
		
		// Return the response payload
		return {...result, isNew: isNew};
	}

	getNouns(): EmojiNoun[] {
		return this.nouns;
	}
}
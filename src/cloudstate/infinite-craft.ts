import { cloudstate } from "freestyle-sh";
import { EmojiNoun, EmojiNounRes } from "./emoji-noun";
import { getFirstEmoji } from "../helpers/emoji-strings";

import Anthropic from "@anthropic-ai/sdk";
import type { Message } from "@anthropic-ai/sdk/resources/messages.mjs";
import Prompts from "../prompts/prompts";

let anthropic = new Anthropic();

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
		
		// Parse best noun
		const bestNoun: string = JSON.parse((possibleNounsMsg.content[0] as any).text)["best_choice"];

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
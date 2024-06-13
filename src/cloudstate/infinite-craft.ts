import { cloudstate } from "freestyle-sh";
import { EmojiNoun as EmojiNoun } from "./emoji-noun";
import { getFirstEmoji } from "../helpers/emoji-strings";

import Anthropic from "@anthropic-ai/sdk";
import type { Message } from "@anthropic-ai/sdk/resources/messages.mjs";
import Prompts from "../prompts/prompts";

let anthropic = new Anthropic();

interface PossibleNouns {
	natural_thing_or_animal: string;
	humanmade_thing_or_product: string;
	occupation: string;
	famous_person: string;
	logic_ranking: string[];
}

interface SelectedEmoji {
	all_relevant_emojis: string[];
	best_emoji: string;
}

@cloudstate
export class InfiniteCraftState {
	static id = "infinite-craft" as const;

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

	async craftNoun(a: EmojiNoun, b: EmojiNoun): Promise<EmojiNoun> {
		// Prompt LLM to generate new noun
		const possibleNounsMsg: Message = await anthropic.messages.create({
			model: 'claude-3-haiku-20240307',
			max_tokens: 200,
			temperature: 0.5,
			system: Prompts.GENERATE_NEW_NOUN,
			messages: [
				{
					'role': 'user',
					'content': [
						{
							'type': 'text',
							'text': EmojiNoun.joinText([a, b], ';'),
						},
					],
				},
			],
		});
		
		// Parse possible nouns as JSON
		const possibleNouns: PossibleNouns = JSON.parse((possibleNounsMsg.content[0] as any).text);

		// Randomly select a noun, weighted by order in logic ranking
		const rankedNouns = possibleNouns.logic_ranking;
		
		let randomlyChosenNoun: string = '';
		const cum_prob = [0.4, 0.75, 0.95, 1];
		const randomNum = Math.random();
		for (let i = 0; i < 4; i++) {
			if (randomNum <= cum_prob[i]) {
				randomlyChosenNoun = rankedNouns[i];
				break;
			}
		}

		if (this.nouns.map(nouns => nouns.text).includes(randomlyChosenNoun)) {
			// Randomly chosen noun already exists
			console.log('Noun already exists');
			return this.nouns.find(noun => noun.text === randomlyChosenNoun)!;
		}

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
							'text': randomlyChosenNoun,
						},
					],
				},
			],
		});

		// Parse selected emoji as JSON
		const selectedEmoji: SelectedEmoji = JSON.parse((selectedEmojiMsg.content[0] as any).text);

		const emojiNoun: EmojiNoun = {
			text: randomlyChosenNoun,
			emoji: getFirstEmoji(selectedEmoji.best_emoji),
		};
		
		// Add new noun to the noun list
		this.nouns.push(emojiNoun);
		
		return emojiNoun;
	}

	getNouns(): EmojiNoun[] {
		return this.nouns;
	}
}
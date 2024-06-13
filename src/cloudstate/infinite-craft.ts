import { cloudstate } from "freestyle-sh";
import { EmojiWord } from "./emoji-word";
import { getFirstEmoji } from "../helpers/emoji-strings";

import Anthropic from "@anthropic-ai/sdk";
import type { Message } from "@anthropic-ai/sdk/resources/messages.mjs";
import Prompts from "../prompts/prompts";

const anthropic = new Anthropic();

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
	words: EmojiWord[] = [
		{text: 'Water', emoji: '💧'},
		{text: 'Fire', emoji: '🔥'},
		{text: 'Wind', emoji: '🌬️'},
		{text: 'Earth', emoji: '🌍'},
	];
	async craftWord(a: EmojiWord, b: EmojiWord): Promise<EmojiWord> {
		console.log('\n======== Crafting: ========');
		console.log(a, b)

		// Prompt LLM to generate new word
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
							'text': EmojiWord.joinText([a, b], ';'),
						},
					],
				},
			],
		});
		
		// Parse possible nouns as JSON
		const possibleNouns: PossibleNouns = JSON.parse((possibleNounsMsg.content[0] as any).text);

		console.log('possibleNouns', possibleNouns);

		// Randomly select a noun, weighted by order in logic ranking
		const rankedNouns = possibleNouns.logic_ranking;
		
		let randomlyChosenNoun;
		const randomNum = Math.random();
		console.log('randomNum', randomNum);
		if (randomNum < 0.4) {
			randomlyChosenNoun = rankedNouns[0];
		} else if (randomNum < 0.75) {
			randomlyChosenNoun = rankedNouns[1];
		} else if (randomNum < 0.95) {
			randomlyChosenNoun = rankedNouns[2];
		} else {
			randomlyChosenNoun = rankedNouns[3];
		}

		console.log('randomlyChosenNoun', randomlyChosenNoun);

		if (this.words.map(word => word.text).includes(randomlyChosenNoun)) {
			// Randomly chosen noun already exists
			console.log('word already exists');
			return this.words.find(word => word.text === randomlyChosenNoun)!;
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

		const emojiWord: EmojiWord = {
			text: randomlyChosenNoun,
			emoji: getFirstEmoji(selectedEmoji.best_emoji),
		};
		
		// Add new word to the word list
		this.words.push(emojiWord);
		
		return emojiWord;
	}
	getWords(): EmojiWord[] {
		return this.words;
	}
}
import { cloudstate } from "freestyle-sh";
import Anthropic from "@anthropic-ai/sdk";
import { EmojiWord } from "./emoji-word";
import type { Message } from "@anthropic-ai/sdk/resources/messages.mjs";
import { ICPrompts } from "../prompts/infinite-craft-prompt";

const anthropic = new Anthropic();

interface PossibleNouns {
	natural_thing: string;
	human_thing: string;
	occupation: string;
	famous_person: string;
	logic_ranking: string[];
}

interface SelectedEmoji {
	all_relevant_emojis: string[];
	single_best_emoji: string;
}

enum ICSortMode {
	Alphabetical,
	Emoji,
	Time,
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
		// Load LLM prompt, then fill existing_words variable
		const existingWordsStr = EmojiWord.joinText(this.words, ';');
		const generateNewNounPrompt = ICPrompts.GENERATE_NEW_NOUN.replaceAll('{{existing_words}}', existingWordsStr);

		console.log('======== combining: ========');
		console.log(a, b)

		// Prompt LLM to generate new word
		const possibleNounsMsg: Message = await anthropic.messages.create({
			model: 'claude-3-haiku-20240307',
			max_tokens: 200,
			temperature: 0.5,
			system: generateNewNounPrompt,
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

		console.log('----> possibleNouns', possibleNouns);

		// Randomly select a noun, weighted by order in logic ranking
		const rankedNouns = possibleNouns.logic_ranking;
		
		let randomlyChosenNoun;
		const randomNum = Math.random();
		console.log('----> randomNum', randomNum);
		if (randomNum < 0.4) {
			randomlyChosenNoun = rankedNouns[0];
		} else if (randomNum < 0.75) {
			randomlyChosenNoun = rankedNouns[1];
		} else if (randomNum < 0.95) {
			randomlyChosenNoun = rankedNouns[2];
		} else {
			randomlyChosenNoun = rankedNouns[3];
		}

		console.log('----> randomlyChosenNoun', randomlyChosenNoun);

		if (randomlyChosenNoun.split(' ').length > 2) {
			// Randomly chosen noun is too long
			console.error('----> noun too long');
			throw new Error(`Noun exceeds 2-word limit: ${randomlyChosenNoun}`);
		}
		if (this.words.map(word => word.text).includes(randomlyChosenNoun)) {
			// Randomly chosen noun already exists
			console.log('----> word already exists');
			return this.words.find(word => word.text === randomlyChosenNoun)!;
		}

		// Prompt LLM to pick best emoji
		const selectedEmojiMsg: Message = await anthropic.messages.create({
			model: 'claude-3-haiku-20240307',
			max_tokens: 200,
			temperature: 0.5,
			system: ICPrompts.PICK_BEST_EMOJI,
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
			emoji: selectedEmoji.single_best_emoji,
		};
		
		// Add new word to the word list
		this.words.push(emojiWord);
		
		return emojiWord;
	}
	getWords(sort: ICSortMode = ICSortMode.Alphabetical): EmojiWord[] {
		// TODO: implement sort mode
		return this.words;
	}
}
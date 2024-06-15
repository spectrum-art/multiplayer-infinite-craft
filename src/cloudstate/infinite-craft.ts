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

	globalNounMap: Map<string, EmojiNoun> = new Map();
	nounsByRoomId: Map<string, EmojiNoun[]> = new Map();

	setAnthropicApiKey(apiKey: string) {
		process.env.ANTHROPIC_API_KEY = apiKey;
	}

	async roomExists(roomId: string): Promise<boolean> {
		return this.nounsByRoomId.has(roomId);
	}

	createRoom() {
		const roomId: string = crypto.randomUUID();
		console.log('|cloud> Creating room:', roomId);
		this.nounsByRoomId.set(roomId, [
			{text: 'Water', emoji: '💧'},
			{text: 'Fire', emoji: '🔥'},
			{text: 'Wind', emoji: '🌬️'},
			{text: 'Earth', emoji: '🌍'},
		]);
		console.log('|cloud> Room created:', roomId);
		console.log('|cloud> Room nouns:', this.nounsByRoomId.get(roomId));
		
		return roomId;
	}

	async craftNoun(roomId: string, a: EmojiNoun, b: EmojiNoun): Promise<EmojiNounRes> {
		const anthropic = new Anthropic();
		const roomNouns: EmojiNoun[] = this.getNouns(roomId);

		// Order nouns alphabetically, for consistent keying
		if (a.text > b.text) {
			[a, b] = [b, a];
		}

		if (this.globalNounMap.has(EmojiNoun.createKey(a, b))) {
			// Noun already exists
			console.log('Noun already exists in global map:', EmojiNoun.createKey(a, b));
			const existingNoun: EmojiNoun = this.globalNounMap.get(EmojiNoun.createKey(a, b))!;
			const isNewToRoom = !roomNouns.some(noun => noun.text === existingNoun.text);
			return {...existingNoun, isNew: isNewToRoom};
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
		const existingNoun: EmojiNoun | undefined = roomNouns.find(noun => noun.text === bestNoun);
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
			roomNouns.push(result);
		} else {
			// Noun already exists
			result = existingNoun!;
		}

		// Add `a + b = bestNoun` to the noun map
		this.globalNounMap.set(EmojiNoun.createKey(a, b), result);
		console.log('Added noun to map:', EmojiNoun.createKey(a, b), result);
		
		// Return the response payload
		return {...result, isNew: isNew};
	}

	getNouns(roomId: string): EmojiNoun[] {
		console.log('Getting nouns for room:', roomId);
		let roomNouns: EmojiNoun[];
		if ((roomNouns = this.nounsByRoomId.get(roomId)!) !== undefined) {
			return roomNouns;
		}

		throw new Error(`Room does not exist: ${roomId}`);		
	}
}
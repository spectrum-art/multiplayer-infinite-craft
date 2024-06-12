import { cloudstate } from "freestyle-sh";
import Anthropic from "@anthropic-ai/sdk";
import { EmojiWord } from "./emoji-word";
import type { Message, TextBlock } from "@anthropic-ai/sdk/resources/messages.mjs";
import { INFINITE_CRAFT_PROMPT } from "../prompts/infinite-craft-prompt";

const anthropic = new Anthropic();

interface GenWordDetails {
	possible_texts: string[];
	randomly_chosen_text: string;
	relevant_emojis: string[];
	best_emoji: string;
}

enum ICSortMode {
	Alphabetical,
	Emoji,
	Time,
}

function getFirstEmoji(text: string): string {
    const emojiRegex = /([\u2300-\u27BF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|\uD83C[\uDDE6-\uDDFF]|\uD83D[\uDC00-\uDDFF]|\uD83E[\uDD00-\uDFFF])/g;
    const match = text.match(emojiRegex);
    return match ? match[0] : text;
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
		const icSystemPrompt = INFINITE_CRAFT_PROMPT.replaceAll('{{existing_words}}', existingWordsStr);

		console.log('======== combining: =======');
		console.log(a, b)

		// Prompt LLM to generate new word
		const genWordDetailsMsg: Message = await anthropic.messages.create({
			model: 'claude-3-haiku-20240307',
			max_tokens: 200,
			temperature: 0.5,
			system: icSystemPrompt,
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

		console.log('------?> genWordDetailsMsg', (genWordDetailsMsg.content[0] as any));
		
		// Parse LLM result as JSON
		const genWordDetails: GenWordDetails = JSON.parse((genWordDetailsMsg.content[0] as any).text);
		console.log('----> genWordDetails', genWordDetails);
		const genWord: EmojiWord = {
			text: genWordDetails.randomly_chosen_text,
			emoji: getFirstEmoji(genWordDetails.best_emoji)};
		
		// Add new words to the word list
		if (!this.words.map(word => word.text).includes(genWord.text)) {
			this.words.push(genWord);
		}
		
		return genWord;
	}
	getWords(sort: ICSortMode = ICSortMode.Alphabetical): EmojiWord[] {
		// TODO: implement sort mode
		return this.words;
	}
}
import { cloudstate } from "freestyle-sh";

enum ICSortMode {
	Alphabetical,
	Emoji,
	Time,
}

@cloudstate
export class EmojiWord {
	static id = crypto.randomUUID();
	
	text: string = '';
	emoji: string = '';
}

@cloudstate
export class InfiniteCraft {
	static id = "infinite-craft" as const;
	_words: EmojiWord[] = [
		{text: 'Water', emoji: '💧'},
		{text: 'Fire', emoji: '🔥'},
		{text: 'Wind', emoji: '🌬️'},
		{text: 'Earth', emoji: '🌍'},
	];
	mergeWords(a: string, b: string): EmojiWord {
		// TODO: prompt LLM to generate new word
		const genWord: EmojiWord = {text: '', emoji: ''};
		
		// Add new words to the word list
		if (!(genWord.text in this._words.map(word => word.text))) {
			this._words.push(genWord);
		}

		return genWord;
	}
	words(sort: ICSortMode = ICSortMode.Alphabetical): EmojiWord[] {
		// TODO: implement sort mode
		return this._words;
	}
}
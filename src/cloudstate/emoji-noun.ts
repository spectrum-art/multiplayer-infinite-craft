import { cloudstate } from "freestyle-sh";

@cloudstate
export class EmojiNoun {
	static id = crypto.randomUUID();
	
	text: string = '';
	emoji: string = '';
	discovered: boolean = false;

	static createKey(a: EmojiNoun, b: EmojiNoun): string {
		// Order nouns alphabetically, for consistent keying
		if (a.text > b.text) {
			[a, b] = [b, a];
		}
		return `${a.text};${b.text}`;
	}
	static STARTING_NOUNS: EmojiNoun[] = [
		{text: 'Water', emoji: '💧', discovered: false},
		{text: 'Fire', emoji: '🔥', discovered: false},
		{text: 'Wind', emoji: '🌬️', discovered: false},
		{text: 'Earth', emoji: '🌍', discovered: false},
	];
}

export class EmojiNounRes extends EmojiNoun {
	static id = crypto.randomUUID();
	
	isNewToRoom: boolean = false;
}
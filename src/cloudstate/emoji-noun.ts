import { cloudstate } from "freestyle-sh";

@cloudstate
export class EmojiNoun {
	static id = crypto.randomUUID();
	
	text: string = '';
	emoji: string = '';

	static createKey(a: EmojiNoun, b: EmojiNoun): string {
		return `${a.text};${b.text}`;
	}
}

@cloudstate
export class EmojiNounRes extends EmojiNoun {
	static id = crypto.randomUUID();
	
	isNew: boolean = true;
}
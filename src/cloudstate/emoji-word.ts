import { cloudstate } from "freestyle-sh";

@cloudstate
export class EmojiWord {
	static id = crypto.randomUUID();
	
	text: string = '';
	emoji: string = '';

	static joinText(words: EmojiWord[], delimiter: string = ',') {
		return words.map(word => word.text).join(delimiter);
	}
}
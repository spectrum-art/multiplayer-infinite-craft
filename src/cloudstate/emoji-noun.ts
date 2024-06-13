import { cloudstate } from "freestyle-sh";

@cloudstate
export class EmojiNoun {
	static id = crypto.randomUUID();
	
	text: string = '';
	emoji: string = '';

	static joinText(nouns: EmojiNoun[], delimiter: string = ',') {
		return nouns.map(noun => noun.text).join(delimiter);
	}
}
import { cloudstate } from "freestyle-sh";

@cloudstate
export class EmojiNoun {
	static id = crypto.randomUUID();
	text = "";
	emoji = "";
	discovered = false;
	static createKey(a: EmojiNoun, b: EmojiNoun) {
		return [a.text, b.text].sort().join(";");
	}
	static STARTING_NOUNS: EmojiNoun[] = [
		{ text: "Water", emoji: "💧", discovered: false },
		{ text: "Fire", emoji: "🔥", discovered: false },
		{ text: "Wind", emoji: "🌬️", discovered: false },
		{ text: "Earth", emoji: "🌍", discovered: false },
	];
}

export class EmojiNounChoices {
	obvious = new EmojiNoun();
	witty = new EmojiNoun();
	static fromJson(json: any) {
		return {
			obvious: json.obvious || json.obvious_choice,
			witty: json.witty || json.witty_choice,
		};
	}
	static WITTY_THRESHOLD = 0.7;
}

export class EmojiNounRes extends EmojiNoun {
	isNewToRoom = false;
}

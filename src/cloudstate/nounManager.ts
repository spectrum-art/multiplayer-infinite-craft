import { cloudstate } from "freestyle-sh";
import type { EmojiNoun } from "./noun";

@cloudstate
export class NounManagerCS {
	static id = "noun-manager" as const;
	comboKeysMap = new Map<string, EmojiNoun>();
	addKeyAndNoun(comboKey: string, noun: EmojiNoun) {
		this.comboKeysMap.set(comboKey, noun);
	}
	didTryCombo(comboKey: string) {
		return this.comboKeysMap.has(comboKey);
	}
	getNoun(comboKey: string) {
		const noun = this.comboKeysMap.get(comboKey);
		return noun ? { ...noun } : undefined!;
	}
	hasNoun(noun: EmojiNoun) {
		return Array.from(this.comboKeysMap.values()).some(n => n.text === noun.text);
	}
}

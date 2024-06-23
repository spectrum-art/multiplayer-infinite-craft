import { cloudstate } from 'freestyle-sh';
import type { EmojiNoun } from './noun';

@cloudstate
export class NounManagerCS {
	static id = 'noun-manager' as const;

	comboKeysMap: Map<string, EmojiNoun> = new Map();
	addKeyAndNoun(comboKey: string, noun: EmojiNoun) {
		this.comboKeysMap.set(comboKey, noun);
	}
	didTryCombo(comboKey: string): boolean {
		return this.comboKeysMap.has(comboKey);
	}
	getNoun(comboKey: string): EmojiNoun {
		// Return a copy to prevent mutation
		return {...this.comboKeysMap.get(comboKey)!};
	}
	hasNoun(noun: EmojiNoun): boolean {
		if (this.comboKeysMap.size === 0) {
			return false;
		}
		return Array.from(this.comboKeysMap.values()).some(n => n.text === noun.text);
	}
}
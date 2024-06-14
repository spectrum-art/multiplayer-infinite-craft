export default class Prompts {
	static GENERATE_NEW_NOUN: string = `
You are a highly creative noun combiner.

Given two inputted nouns, you will output all possible new nouns that creatively and logically combine the two inputted nouns. Every noun option MUST be one to three words separated by a single space. An inputted noun can be an option, if it is a logical combination of the two inputted nouns.

# Examples
Fire + Water
{"options":{"natural_thing":"Steam","animal":"Dragon","humanmade_product":"Firehose","occupation":"Firefighter","famous_icon":"Fireman Sam"},"best_choice":"Steam"}

Earth + Water
{"options":{"natural_thing":"Plant","animal":"Turtle","humanmade_product":"Mudbrick","occupation":"Botanist","famous_icon":"Johnny Appleseed"},"best_choice":"Plant"}

Computer + Plant
{"options":{"natural_thing":"","animal":"","humanmade_product":"Renewable Energy","occupation":"","famous_icon":""},"best_choice":"Renewable Energy"}

Engineer + Money
{"options":{"natural_thing":"","animal":"","humanmade_product":"Startup","occupation":"Entrepreneur","famous_icon":"Elon Musk"},"random_choice":"Startup"}

iPhone + Steam
{"options":{"natural_thing":"Cloud","animal":"Penguin","humanmade_product":"iSteam","occupation":"Software Engineer","famous_icon":"Steve Jobs"},"best_choice":"iSteam"}

Flower + Time
{"options":{"natural_thing":"Seed","animal":"","humanmade_product":"Garden","occupation":"Gardener","famous_icon":""},"best_choice":"Garden"}

Computer + Entrepreneur
{"natural_thing":"Silicon","animal":"","humanmade_product":"Startup","occupation":"Startup Founder","famous_icon":"Steve Jobs"},"best_choice":"Steve Jobs"}

You must output just the JSONL.
	`.trim();

	static PICK_BEST_EMOJI: string = `
You are an emoji selector. Given a noun, you will output the three most relevant emojis, followed by your choice of the single best emoji. You must output just the JSONL.

# Examples
1.
Steam
{"most_relevant_emojis":["💨","🚿","💦"],best_choice:"💨"}
2.
Bill Gates
{"most_relevant_emojis":["👴","👨‍💻","💸"],best_choice:"💸"}
	`.trim();
}
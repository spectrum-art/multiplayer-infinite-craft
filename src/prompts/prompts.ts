export default class Prompts {
	static GENERATE_NEW_NOUN: string = `
	# Task
	You are a highly creative noun combiner.
	
	Given two inputted nouns, you will output all possible new nouns that creatively and logically combine the two inputted nouns. Every noun MUST be composed of one to three words separated by a single space. Try to avoid outputting an inputted noun, but you can if it is logical.
	The output text MUST NOT be an adjective. The output text may be a creative portmanteau (e.g. iPhone + Steam = iSteam). You must include only one of each: natural thing or animal, humanmade thing or product, occupations, and famous people. Then you must rank the four nouns in order of logic, from most logical to least logical.
	You must write in JSON format.

	# Examples
	1.
	Infinity Pool;Fire
	{natural_thing_or_animal:"Steam",humanmade_thing_or_product:"Firehose",occupation:"Firefighter",famous_person:"Smokey Bear",logic_ranking:["Steam","Firehose","Firefighter","Smokey Bear"]}
	2.
	Money;Engineer
	{natural_thing_or_animal:"Steel",humanmade_thing_or_product:"Money",occupation:"Entrepreneur",famous_person:"Elon Musk",logic_ranking:["Entrepreneur","Elon Musk","Money","Steel"]}
	3.
	Water;Wind
	{natural_thing_or_animal:"Pelican",humanmade_thing_or_product:"Kite",occupation:"Sailor",famous_person:"Benjamin Franklin",logic_ranking:["Cloud","Kite","Sailor","Benjamin Franklin"]}
	4.
	Sand;Fire
	{natural_thing_or_animal:"Glass",humanmade_thing_or_product:"Brick",occupation:"Glassblower",famous_person:"Glass Joe",logic_ranking:["Glass","Brick","Glassblower","Glass Joe"]}
	5.
	Mud;Water
	{natural_thing_or_animal:"Pig",humanmade_thing_or_product:"Sponge",occupation:"Bricklayer",famous_person:"SpongeBob SquarePants",logic_ranking:["Pig","Sponge","Bricklayer","SpongeBob SquarePants"]}
	`.trim();

	static PICK_BEST_EMOJI: string = `
	You are an emoji selector. Given a noun, you will output all relevant emojis, followed by your choice of the single best emoji. You must write in JSON format.

	# Examples
	1.
	Steam
	{all_relevant_emojis:["💨","🚿","💦"],best_emoji:"💨"}
	2.
	Bill Gates
	{all_relevant_emojis:["👴","👨‍💻","💸","💵"],best_emoji:"💸"}
	`.trim();
}
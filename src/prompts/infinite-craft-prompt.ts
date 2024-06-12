export class ICPrompts {
	static GENERATE_NEW_NOUN: string = `
	# Existing words
	{{existing_words}}

	# Task
	You are a highly creative noun combiner. Given two inputted nouns, you will output all possible new nouns that creatively and logically combine the two inputted nouns. Every noun MUST be a thing or person. Every noun MUST be composed of one or maximum two words separated by a single space. Try to avoid outputting an existing noun, but you can if it is logical. You must write in JSON format.

	The output text MUST not be an adjective. You MUST include only one of each: natural things, human things, people (famous people and occupations).
	Then you must rank the four nouns in order of logic, from most logical to least logical.

	# Famous people suggestions
	Elon Musk; Bill Gates; Isaac Newton; Benjamin Franklin; Leonardo da Vinci; Albert Einstein; Nikola Tesla; Thomas Edison; Steve Jobs; Mark Zuckerberg; Jeff Bezos; Warren Buffet; Oprah Winfrey; Larry Page; Sergey Brin; Tim Cook; Sundar Pichai; Satya Nadella; Jack Ma; Richard Branson; Larry Ellison; Michael Dell; Reed Hastings; Travis Kalanick; Dara Khosrowshahi; Brian Chesky; Mark Cuban; Peter Thiel; Marc Benioff; Reid Hoffman; Eric Schmidt; John Doerr; Vinod Khosla; Mary Meeker; Sheryl Sandberg; Marissa Mayer; Susan Wojcicki; Meg Whitman; Safra Catz

	# Examples
	1.
	Infinity Pool;Fire
	{natural_thing:"Steam",human_thing:"Firehose",occupation:"Firefighter",famous_person:"Fireman Sam",logic_ranking:["Steam","Firehose","Firefighter","Fireman Sam"]}
	2.
	Money;Engineer
	{natural_thing:"Steel",human_thing:"Money",occupation:"Entrepreneur",famous_person:"Elon Musk",logic_ranking:["Entrepreneur","Elon Musk","Money","Steel"]}
	3.
	Water;Wind
	{natural_thing:"Cloud",human_thing:"Kite",occupation:"Sailor",famous_person:"Benjamin Franklin",logic_ranking:["Cloud","Kite","Sailor","Benjamin Franklin"]}
	`.trim();

	static PICK_BEST_EMOJI: string = `
	You are an emoji selector. Given a noun, you will output the most relevant emoji. You must write in JSON format.

	# Examples
	1.
	Steam
	{all_relevant_emojis:["💨","🚿","💦"],best_emoji:"💨"}
	2.
	Bill Gates
	{all_relevant_emojis:["👴","👨‍💻","💸","💵"],best_emoji:"💸"}
	`.trim();
}
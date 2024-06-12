import { useCloud } from "freestyle-sh";
import { EmojiWord } from "../../cloudstate/emoji-word";
import type { InfiniteCraftState } from "../../cloudstate/infinite-craft";
import Chip from "./chip";
import { useState } from "react";
import { QueryClient, QueryClientProvider, useMutation, useQuery } from "@tanstack/react-query";

interface InfiniteCraftAppProps {
	words: ReturnType<InfiniteCraftState["getWords"]>;
}

export default function InfiniteCraftApp(props: InfiniteCraftAppProps) {
	const queryClient = new QueryClient();
	return (
		<QueryClientProvider client={queryClient}>
			<ChipList {...props} />
		</QueryClientProvider>
	)
}

function ChipList(props: InfiniteCraftAppProps) {
	const icState = useCloud<typeof InfiniteCraftState>("infinite-craft");

	const { data: words, refetch } = useQuery({
		queryKey: ["infinite-craft", "getWords"],
		queryFn: () => icState.getWords(),
		initialData: props.words,
	});
	const { isPending: isCrafting, mutate: craftWord } = useMutation({
		mutationFn: ({ a, b }: { a: EmojiWord, b: EmojiWord }) => icState.craftWord(a, b),
		// onError: (error) => console.error('Error crafting word:', error),
		onSuccess: () => refetch(),
	});

	const [selectedIdxs, setSelectedIdxs] = useState<number[]>([]);
	const selectChip = (idx: number) => {
		console.log('selectChip', idx);
		let newSelectedIdxs: number[];

		if (selectedIdxs.includes(idx)) {
			// Currently selected: unselect chip
			newSelectedIdxs = selectedIdxs.filter(selectedIdx => selectedIdx !== idx);
		} else {
			// Not yet selected: select chip
			newSelectedIdxs = [...selectedIdxs, idx];
		}

		console.log('newSelectedIdxs', newSelectedIdxs)

		if (newSelectedIdxs.length === 2) {
			// Two chips selected: craft word
			const [a, b] = newSelectedIdxs.map(selectedIdx => words[selectedIdx]);
			craftWord({ a, b });

			// Reset selected chips
			newSelectedIdxs = [];
		}
		console.log('newSelectedIdxs', newSelectedIdxs)
		setSelectedIdxs(newSelectedIdxs);
	}

	return (
		<div className="chip-list">
			{words.map((word, idx) =>
				<Chip
					key={idx}
					text={`${word.emoji} ${word.text}`}
					isSelected={selectedIdxs.includes(idx)}
					onClick={() => { selectChip(idx) }}
				/>
			)}
		</div>
	);
}
import { useState } from "react";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import Chip from "./chip";

import { useCloud } from "freestyle-sh";
import type { EmojiNoun } from "../cloudstate/noun";
import type { RoomCS } from "../cloudstate/room";
import { QueryClient, QueryClientProvider, useMutation, useQuery } from "@tanstack/react-query";
import { Slide, toast, ToastContainer } from "react-toastify";
import 'react-toastify/ReactToastify.css';

interface InitialState {
	roomId: string;
	nouns: EmojiNoun[];
}

export default function InfiniteCraftApp(props: InitialState) {
	const queryClient = new QueryClient();
	return (
		<QueryClientProvider client={queryClient}>
			<ChipList {...props} />
			<style>{`
				  .chip-container-enter {
					transform: scale(0.8);
					opacity: 0;
				  }
				  .shake {
					animation: shake 0.5s;
				  }
				  @keyframes shake {
					0% { transform: translate(1px, 1px) rotate(0deg); }
					20% { transform: translate(-1px, -2px) rotate(-1deg); }
					40% { transform: translate(-3px, 0px) rotate(1deg); }
					60% { transform: translate(3px, 2px) rotate(0deg); }
					80% { transform: translate(1px, -1px) rotate(1deg); }
					100% { transform: translate(1px, 1px) rotate(0deg); }
				  }
            `}</style>
		</QueryClientProvider>
	)
}

function ChipList(props: InitialState) {
	const room = useCloud<typeof RoomCS>(props.roomId);

	const { data: nouns, refetch: refetchNouns } = useQuery({
		queryKey: [props.roomId, "getNouns"],
		queryFn: () => room.getNouns(),
		initialData: props.nouns,
	});
	const { isPending: isCrafting, mutate: craftNoun } = useMutation({
		mutationFn: ({ a, b }: { a: EmojiNoun, b: EmojiNoun }) => room.craftNoun(a, b),
		onSuccess: (emojiNounRes) => {
			// Reset selected chips
			setSelectedIdxs([]);

			if (!emojiNounRes.isNewToRoom) {
				// Noun already exists: shake existing chip
				const chipIdx = nouns.findIndex(noun => noun.text === emojiNounRes.text)
				setShakingIdx(chipIdx);
				setTimeout(() => setShakingIdx(null), 500);
			}

			// Refetch nouns
			refetchNouns();
		},
		onError: (error) => {
			console.error('Error crafting noun:', error);
			setSelectedIdxs([]);
		}
		,
	});

	const [selectedIdxs, setSelectedIdxs] = useState<number[]>([]);
	const [shakingIdx, setShakingIdx] = useState<number | null>(null);
	const selectChip = (idx: number) => {
		const newSelectedIdxs = [...selectedIdxs, idx];
		if (newSelectedIdxs.length === 2) {
			// Two chips selected: craft noun
			const [a, b] = newSelectedIdxs.map(selectedIdx => nouns[selectedIdx]);
			craftNoun({ a, b });
		}

		setSelectedIdxs(newSelectedIdxs);
	}
	const hasStarted = nouns.length > 4;

	return (
		<div>
			<div className="flex flex-row items-center justify-center mt-2 mb-10">
				<p className="text-center text-gray-300">
					{hasStarted ? props.roomId : "Select any two nouns to craft a new one."}
				</p>
				{hasStarted &&
					<button className="text-gray-300 hover:text-white transition ml-2" onClick={() => {
						toast.success('Room ID copied to clipboard!', {
							position: "bottom-right",
							autoClose: 1500,
							hideProgressBar: true,
							closeOnClick: true,
							pauseOnHover: true,
							draggable: true,
							progress: undefined,
							theme: "dark",
							transition: Slide,
						});
						navigator.clipboard.writeText(props.roomId);
					}}>
						<svg className="" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
					</button>}
			</div>
			<div className="chip-list mx-6 my-4">
				<TransitionGroup>
					{nouns.map((noun, idx) =>
						<CSSTransition key={idx} timeout={500} classNames="chip-container">
							<Chip
								text={`${noun.emoji} ${noun.text}`}
								isStarred={noun.discovered}
								isSelected={selectedIdxs.includes(idx)}
								onClick={() => { selectChip(idx) }}
								isShaking={shakingIdx === idx}
								disabled={isCrafting}
							/>
						</CSSTransition>
					)}
				</TransitionGroup>
			</div>
			{isCrafting && <div className="text-center text-md text-gray-300 mt-8">Crafting...</div>}
			<ToastContainer />
		</div>
	);
}
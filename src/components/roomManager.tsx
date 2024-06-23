import { useCloud } from "freestyle-sh";
import { RoomManagerCS } from "../cloudstate/roomManager";
import { useState } from "react";
import { navigate } from "astro:transitions/client";
import toast, { Toaster } from "react-hot-toast";

export default function RoomManager() {
	const [textInput, setTextInput] = useState("");

	const roomManager = useCloud<typeof RoomManagerCS>(RoomManagerCS.id);
	const joinRoom = async (roomId: string) => {
		if (roomId.length == 0) {
			return;
		}
		if (!(await roomManager.roomExists(roomId))) {
			toast.error(`Room "${roomId}" does not exist`, {
				position: "bottom-right",
				duration: 2000,
			});
			return;
		}

		// Go to room page
		navigate(`/room/${roomId}`);
	};
	const createRoom = async () => {
		const roomId = await roomManager.createRoom();
		navigate(`/room/${roomId}`);
	};

	return (
		<div className="flex flex-col justify-center items-center">
			<div className="flex flex-row justify-center items-center mt-4 mb-8">
				<form onSubmit={(ev) => {
					ev.preventDefault();
					joinRoom(textInput);
				}}>
					<input
						type="text"
						className="flex mr-3 px-2 py-1 bg-gray-200 rounded-md"
						autoFocus
						value={textInput}
						placeholder="Room ID"
						onChange={(ev) => setTextInput(ev.target.value)}
					/>
				</form>
				<button
					className="px-3 py-1 bg-gray-700 text-white rounded-md"
					onClick={() => joinRoom(textInput)}
				>
					Join Room
				</button>
			</div>
			<p className="text-gray-300">Or</p>
			<div className="flex w-full justify-center mt-8">
				<button
					className="px-3 py-1 bg-green-700 text-white rounded-md"
					onClick={createRoom}
				>
					Create Room
				</button>
			</div>
			<Toaster />
		</div>
	);
}

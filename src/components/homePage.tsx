import { useCloud } from "freestyle-sh";
import { useState } from "react";
import type { RoomManagerCS } from "../cloudstate/infinite-craft";

export default function HomePage() {
	const roomManager = useCloud<typeof RoomManagerCS>("room-manager");
	const [textInput, setTextInput] = useState('');

	const joinRoom = async (roomId: string) => {
		if (!(await roomManager.roomExists(roomId))) {
			console.error(`Room ${roomId} does not exist`);
			return;
		}

		// Go to room page
		location.replace(`/room/${roomId}`);
	}

	const createRoom = async () => {
		const roomId = await roomManager.createRoom();
		location.replace(`/room/${roomId}`);
	}

	return (
		<div className="flex flex-col justify-center">
			<h1>Home Page</h1>
			<div className="flex flex-row justify-center items-center my-4">
				<input
					type="text"
					className="mr-3 border-gray-400 border"
					value={textInput}
					onChange={(ev) => setTextInput(ev.target.value)}
				/>
				<button
					className="px-2 py-1 bg-gray-100"
					onClick={() => joinRoom(textInput)}
				>
					Join Room
				</button>
			</div>
			<div className="flex w-full justify-center">
				<button
					className="px-2 py-1 bg-blue-600 text-white"
					onClick={createRoom}
				>
					Create Room
				</button>
			</div>
		</div >
	);
}
import { cloudstate } from "freestyle-sh";
import { RoomCS } from "./room";
import { generateUsername } from "friendly-username-generator";

@cloudstate
export class RoomManagerCS {
	static id = "room-manager" as const;

	roomsMap: Map<string, RoomCS> = new Map();
	roomExists(roomId: string): boolean {
		return this.roomsMap.has(roomId);
	}
	createRoom(): string {
		const roomId = this._newRoomId();
		const room = new RoomCS(roomId);
		this.roomsMap.set(roomId, room);
		return roomId;
	}
	_newRoomId() {
		const numAttempts = 10;
		let roomId;
		for (let i = 0; i < numAttempts; i++) {
			roomId = generateUsername({useHyphen: true, useRandomNumber: false});
			if (!this.roomExists(roomId)) {
				console.log(`${roomId} is new`);
				return roomId;
			}
		}
		throw Error("Too many attempts to create a unique Room ID.");
	}
}
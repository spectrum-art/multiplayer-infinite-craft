import { cloudstate } from "freestyle-sh";
import { RoomCS } from "./room";
import { generateUsername } from "friendly-username-generator";

@cloudstate
export class RoomManagerCS {
	static id = "room-manager" as const;
	roomsMap = new Map<string, RoomCS>();
	roomExists(roomId: string) {
		return this.roomsMap.has(roomId);
	}
	createRoom() {
		let roomId;
		do {
			roomId = generateUsername({ useHyphen: true, useRandomNumber: false });
		} while (this.roomExists(roomId));
		this.roomsMap.set(roomId, new RoomCS(roomId));
		return roomId;
	}
}

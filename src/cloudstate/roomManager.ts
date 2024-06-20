import { cloudstate } from "freestyle-sh";
import { RoomCS } from "./room";

@cloudstate
export class RoomManagerCS {
	static id = "room-manager" as const;

	roomsMap: Map<string, RoomCS> = new Map();
	async roomExists(roomId: string): Promise<boolean> {
		return this.roomsMap.has(roomId);
	}
	async createRoom(): Promise<string> {
		const room = new RoomCS();
		const roomId = room.getId();
		this.roomsMap.set(roomId, room);
		return roomId;
	}
}
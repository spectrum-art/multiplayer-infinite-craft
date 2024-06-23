import { cloudstate } from 'freestyle-sh';
import { RoomCS } from './room';
import { generateUsername } from 'friendly-username-generator';

@cloudstate
export class RoomManagerCS {
	static id = 'room-manager' as const;

	roomsMap: Map<string, RoomCS> = new Map();
	roomExists(roomId: string): boolean {
		return this.roomsMap.has(roomId);
	}
	createRoom(): string {
		const roomId = this._generateRoomId();
		const room = new RoomCS(roomId);
		this.roomsMap.set(roomId, room);
		return roomId;
	}
	_generateRoomId(): string {
		let roomId;
		do {
			roomId = generateUsername({useHyphen: true, useRandomNumber: false});
		} while (this.roomExists(roomId));
		return roomId;
	}
}
import { Elysia, t } from "elysia";
import {
	type JoinLeaveMessage,
	type Message,
	SOCKET_ENUM,
	State,
	type Viewer,
} from "../types";

const roomSet = new Map<
	string,
	{
		userSet: Map<string, Set<unknown>>;
		instanceSet: Map<
			string,
			{
				username: string;
				id: string;
				displayName: string;
			}
		>;
	}
>();

const ws = new Elysia().ws("/:roomId?", {
	open: ({
		subscribe,
		data: {
			params: { roomId = "root" },
		},
	}) => {
		// console.log(`[OPEN]: ${ws.id}`);
		subscribe(roomId);
		
		if (!roomSet.has(roomId)) {
			roomSet.set(roomId, {
				userSet: new Map<string, Set<unknown>>(),
				instanceSet: new Map<
					string,
					{
						username: string;
						id: string;
						displayName: string;
					}
				>(),
			});
			console.log(`Created room: ${roomId}`);
		}
	},
	message: (
		{
			send,
			publish,
			id: wsId,
			data: {
				params: { roomId = "root" },
			},
		},
		message,
	) => {
		const room = roomSet.get(roomId);
		if (!room) return;

		const userSet = room.userSet;
		const instanceSet = room.instanceSet;

		const { type, payload } = message as {
			type: SOCKET_ENUM;
			payload: Message | JoinLeaveMessage | Viewer;
		};

		switch (type) {
			case SOCKET_ENUM.PING: {
				break;
			}
			case SOCKET_ENUM.NEW_MESSAGE: {
				send(JSON.stringify(message));
				publish(roomId, JSON.stringify(message));
				break;
			}
			case SOCKET_ENUM.NEW_USER: {
				const { username, id, global_name } = payload as Viewer;

				if (!userSet.has(id)) {
					userSet.set(id, new Set());
				}
				userSet.get(id)?.add(wsId);

				if (!instanceSet.has(id)) {
					publish(
						roomId,
						JSON.stringify({
							type: SOCKET_ENUM.USER_STATE,
							payload: {
								username,
								id,
								state: State.JOIN,
							},
						}),
					);
				}

				instanceSet.set(id, {
					username,
					id,
					displayName: global_name ?? username,
				});

				publish(
					roomId,
					JSON.stringify({
						type: SOCKET_ENUM.UPDATE_USERCOUNT,
						payload: Array.from(instanceSet.values()),
					}),
				);

				send(
					JSON.stringify({
						type: SOCKET_ENUM.UPDATE_USERCOUNT,
						payload: Array.from(instanceSet.values()),
					}),
				);
				break;
			}
		}
		// console.log(`[MESSAGE]: ${ws.id} - ${JSON.stringify(message)}`);
	},
	close: ({
		publish,
		id,
		send,
		unsubscribe,
		data: {
			params: { roomId = "root" },
		},
	}) => {
		// console.log(`[CLOSE]: ${ws.id}`);
		const room = roomSet.get(roomId);
		if (!room) return;

		const userSet = room.userSet;
		const instanceSet = room.instanceSet;

		for (const [key, set] of userSet?.entries() ?? []) {
			if (!set.has(id)) continue;
			set.delete(id);

			if (set.size === 0) {
				userSet?.delete(key);
				instanceSet?.delete(key);
			}
		}

		publish(
			roomId,
			JSON.stringify({
				type: SOCKET_ENUM.UPDATE_USERCOUNT,
				payload: Array.from(instanceSet?.values() ?? []),
			}),
		);

		send(
			JSON.stringify({
				type: SOCKET_ENUM.UPDATE_USERCOUNT,
				payload: Array.from(instanceSet?.values() ?? []),
			}),
		);


		if (!instanceSet.size) {
			roomSet.delete(roomId);
			console.log(`Deleted room: ${roomId}`);
		}

		unsubscribe(roomId);
	},
	params: t.Object({
		roomId: t.Optional(t.String()),
	}),
});

export default ws;

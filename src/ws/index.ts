import { Elysia } from "elysia";
import {
	type JoinLeaveMessage,
	type Message,
	SOCKET_ENUM,
	State,
	type Viewer,
} from "../types";

const userSet = new Map<string, Set<unknown>>();
const instanceSet = new Map<
	string,
	{
		username: string;
		id: string;
		displayName: string;
	}
>();

const ws = new Elysia().ws("/", {
	open(ws) {
		// console.log(`[OPEN]: ${ws.id}`);
		ws.subscribe("broadcast");
	},
	message(ws, message) {
		const { type, payload } = message as {
			type: SOCKET_ENUM;
			payload: Message | JoinLeaveMessage | Viewer;
		};

		switch (type) {
			case SOCKET_ENUM.PING: {
				break;
			}
			case SOCKET_ENUM.NEW_MESSAGE: {
				ws.send(JSON.stringify(message));
				ws.publish("broadcast", JSON.stringify(message));
				break;
			}
			case SOCKET_ENUM.NEW_USER: {
				const { username, id, global_name } = payload as Viewer;
				if (!userSet.has(id)) {
					userSet.set(id, new Set());
				}
				userSet.get(id)?.add(ws.id);

				if (!instanceSet.has(id)) {
					ws.publish(
						"broadcast",
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

				ws.publish(
					"broadcast",
					JSON.stringify({
						type: SOCKET_ENUM.UPDATE_USERCOUNT,
						payload: Array.from(instanceSet.values()),
					}),
				);

				ws.send(
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
	close(ws) {
		// console.log(`[CLOSE]: ${ws.id}`);

		for (const [key, set] of userSet.entries()) {
			if (!set.has(ws.id)) continue;
			set.delete(ws.id);

			if (set.size === 0) {
				userSet.delete(key);
				instanceSet.delete(key);
			}
		}

		ws.publish(
			"broadcast",
			JSON.stringify({
				type: SOCKET_ENUM.UPDATE_USERCOUNT,
				payload: Array.from(instanceSet.values()),
			}),
		);

		ws.send(
			JSON.stringify({
				type: SOCKET_ENUM.UPDATE_USERCOUNT,
				payload: Array.from(instanceSet.values()),
			}),
		);

		ws.unsubscribe("broadcast");
	},
});

export default ws;

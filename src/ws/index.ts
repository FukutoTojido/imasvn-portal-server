import { Elysia } from "elysia";
import {
	type JoinLeaveMessage,
	type Message,
	SOCKET_ENUM,
	State,
	type Viewer,
} from "../types";

const userSet = new Map();

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
				const { username, id } = payload as Viewer;
				userSet.set(ws.id, {
					username,
					id,
				});

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

				ws.publish(
					"broadcast",
					JSON.stringify({
						type: SOCKET_ENUM.UPDATE_USERCOUNT,
						payload: Array.from(userSet.values()),
					}),
				);

				ws.send(
					JSON.stringify({
						type: SOCKET_ENUM.UPDATE_USERCOUNT,
						payload: Array.from(userSet.values()),
					}),
				);
				break;
			}
		}
		// console.log(`[MESSAGE]: ${ws.id} - ${JSON.stringify(message)}`);
	},
	close(ws) {
		// console.log(`[CLOSE]: ${ws.id}`);
		userSet.delete(ws.id);
		ws.unsubscribe("broadcast");
	},
});

export default ws;

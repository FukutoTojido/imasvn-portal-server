import cors from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import { Elysia } from "elysia";
import auth from "./auth";
import characters from "./characters";
import emojis from "./emojis";
import posts from "./posts";
import preview from "./preview";
import producerId from "./producerId";
import users from "./users";
import whep from "./whep";
import ws from "./ws";
import events from "./events";

const app = new Elysia({
	websocket: {
		idleTimeout: 120,
	},
})
	.use(
		swagger({
			documentation: {
				tags: [
					{ name: "Auth" },
					{ name: "Users" },
					{ name: "Posts" },
					{ name: "Characters" },
					{ name: "Emojis" },
					{ name: "Live" },
				],
			},
		}),
	)
	.use(cors())
	.group("/api", (app) =>
		app
			.get("/", () => "Welcome to Ave Mujica.")
			.use(auth)
			.use(users)
			.use(posts)
			.use(whep)
			.use(preview)
			.use(characters)
			.use(emojis)
			.use(ws)
			.use(producerId)
			.use(events),
	)
	.listen(3001);

console.log(
	`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);

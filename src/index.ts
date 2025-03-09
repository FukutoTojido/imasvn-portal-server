import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";

import users from "./users";
import characters from "./characters";
import emojis from "./emojis";
import posts from "./posts";
import whep from "./whep";
import auth from "./auth";
import cors from "@elysiajs/cors";
import ws from "./ws";
import preview from "./preview";

const app = new Elysia({
	websocket: {
		idleTimeout: 960,
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
			.use(ws),
	)
	.listen(3001);

console.log(
	`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);

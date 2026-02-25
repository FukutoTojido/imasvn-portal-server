import { Elysia } from "elysia";
import { privillage, token } from "../../middleware";
import assets from "./assets";
import deleteEpisode from "./deleteEpisode";
import getEpisode from "./getEpisode";
import getEpisodes from "./getEpisodes";
import patchEpisode from "./patchEpisode";
import patchEpisodes from "./patchEpisodes";
import postEpisode from "./postEpisode";

const episodes = new Elysia({ detail: { tags: ["Anime"] } }).group(
	"/anime/:id/episodes",
	(app) =>
		app
			.group("", (app) =>
				app
					.use(privillage)
					.use(postEpisode)
					.use(patchEpisode)
					.use(patchEpisodes)
					.use(deleteEpisode),
			)
			.group("", (app) => app.use(token).use(getEpisodes).use(getEpisode))
			.use(assets),
);

export default episodes;

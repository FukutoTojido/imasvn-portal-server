import { Elysia } from "elysia";
import assets from "./assets";
import getEpisode from "./getEpisode";
import getEpisodes from "./getEpisodes";
import patchEpisode from "./patchEpisode";
import postEpisode from "./postEpisode";
import { privillage, token } from "../../middleware";
import patchEpisodes from "./patchEpisodes";
import deleteEpisode from "./deleteEpisode";

const episodes = new Elysia().group("/anime/:id/episodes", (app) =>
	app
		.group("", (app) =>
			app
				.use(privillage)
				.use(postEpisode)
				.use(patchEpisode)
				.use(patchEpisodes)
				.use(deleteEpisode),
		)
		.group("", (app) =>
			app.use(token).use(getEpisodes).use(getEpisode),
		)
		.use(assets),
);

export default episodes;

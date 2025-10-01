import { Elysia } from "elysia";
import { privillage, token } from "../middleware";
import deleteAnime from "./deleteAnime";
import getAnime from "./getAnime";
import getAnimes from "./getAnimes";
import patchAnime from "./patchAnime";
import postAnime from "./postAnime";

const anime = new Elysia().group("/anime", (app) =>
	app
		.group("", (app) => app.use(privillage).use(postAnime).use(patchAnime).use(deleteAnime))
		.group("", (app) => app.use(token).use(getAnimes))
		.use(getAnime),
);

export default anime;

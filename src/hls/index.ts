import { Elysia } from "elysia";
import getProxy from "./getProxy";
import postProxy from "./postProxy";

const hls = new Elysia().group("/hls", (app) =>
	app.use(getProxy).use(postProxy),
);

export default hls;

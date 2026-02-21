import { Elysia } from "elysia";
import getM3U8 from "./getM3U8";
import getProxy from "./getProxy";
import postProxy from "./postProxy";

const hls = new Elysia().group("/hls", (app) =>
	app.use(getProxy).use(postProxy).use(getM3U8),
);

export default hls;

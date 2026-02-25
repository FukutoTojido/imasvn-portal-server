import { Elysia } from "elysia";
import { privillage, token } from "../middleware";
import {
	deleteProxies,
	getAllProxies,
	getProxies,
	patchProxies,
	postProxies,
} from "./proxies";

const hls = new Elysia({
	detail: {
		tags: ["Live"],
	},
}).group("/hls", (app) =>
	app
		.group("", (app) => app.use(token).use(getAllProxies).use(getProxies))
		.group("", (app) =>
			app.use(privillage).use(postProxies).use(patchProxies).use(deleteProxies),
		),
);

export default hls;

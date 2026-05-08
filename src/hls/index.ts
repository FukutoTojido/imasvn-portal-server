import { Elysia } from "elysia";
import { privillage, token } from "../middleware";
import DRM, { DRMData } from "./drm";
import {
	deleteProxies,
	getAllProxies,
	getProxies,
	getProxiesPreview,
	patchProxies,
	postProxies,
} from "./proxies";

const hls = new Elysia({
	detail: {
		tags: ["Live"],
	},
}).group("/hls", (app) =>
	app
		.use(getAllProxies)
		.use(getProxies)
		.use(getProxiesPreview)
		.group("", (app) => app.use(token).use(DRM))
		.group("", (app) =>
			app
				.use(privillage)
				.use(postProxies)
				.use(patchProxies)
				.use(deleteProxies)
				.use(DRMData),
		),
);

export default hls;

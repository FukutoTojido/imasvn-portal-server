import { Elysia } from "elysia";
import { privillage, token } from "../middleware";
import DRM from "./drm";
import forward from "./forward";
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
		.use(forward)
		.use(getAllProxies)
		.use(getProxies)
		.use(getProxiesPreview)
		.group("", (app) => app.use(token).use(DRM))
		.group("", (app) =>
			app.use(privillage).use(postProxies).use(patchProxies).use(deleteProxies),
		),
);

export default hls;

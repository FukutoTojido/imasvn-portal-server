import Elysia from "elysia";
import events from "./events";

const live = new Elysia({
	detail: {
		tags: ["Live 2"],
	},
}).group("/live", (app) => app.use(events));

export default live;

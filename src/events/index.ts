import { Elysia } from "elysia";
import { privillage } from "../middleware";
import deleteEvent from "./deleteEvent";
import getEvent from "./getEvent";
import getEvents from "./getEvents";
import patchEvent from "./patchEvent";
import postEvent from "./postEvent";

const events = new Elysia().group("/events", (app) =>
	app
		.use(getEvents)
		.use(getEvent)
		.group("", (app) =>
			app.use(privillage).use(postEvent).use(patchEvent).use(deleteEvent),
		),
);

export default events;

import Elysia from "elysia";
import cards from "./cards";
import getProducer from "./getProducer";
import getProducers from "./getProducers";
import postProducer from "./postProducer";
import deleteProducer from "./deleteProducer";
import { privillage } from "../middleware";

const producerId = new Elysia().group("/producer-id", (app) =>
	app
		.use(getProducer)
		.group("", (app) =>
			app
				.use(privillage)
				.use(getProducers)
				.use(postProducer)
				.use(deleteProducer),
		)
		.use(cards),
);

export default producerId;

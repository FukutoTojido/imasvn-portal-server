import Elysia from "elysia";
import cards from "./cards";
import getProducer from "./getProducer";
import getProducers from "./getProducers";
import postProducer from "./postProducer";
import deleteProducer from "./deleteProducer";

const producerId = new Elysia().group("/producer-id", (app) =>
	app
		.use(getProducers)
		.use(getProducer)
		.use(postProducer)
		.use(deleteProducer)
		.use(cards),
);

export default producerId;

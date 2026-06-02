import Elysia from "elysia";
import { privillage } from "../middleware";
import cards from "./cards";
import getAllCards from "./cards/getAllCards";
import deleteProducer from "./deleteProducer";
import getProducer from "./getProducer";
import getProducers from "./getProducers";
import postProducer from "./postProducer";

const producerId = new Elysia()
	.group("/cards", (app) => app.use(privillage).use(getAllCards))
	.group("/producer-id", (app) =>
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

import { Elysia } from "elysia";
import { privillage } from "../../middleware";
import deleteCard from "./deleteCard";
import getCard from "./getCard";
import getCards from "./getCards";
import patchCard from "./patchCard";
import postCard from "./postCard";

const cards = new Elysia().group("/:id/cards", (app) =>
	app
		.use(getCards)
		.use(getCard)
		.group("", (app) =>
			app.use(privillage).use(postCard).use(patchCard).use(deleteCard),
		),
);

export default cards;

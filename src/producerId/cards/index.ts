import { Elysia } from "elysia";
import getCard from "./getCard";
import getCards from "./getCards";
import postCard from "./postCard";
import patchCard from "./patchCard";
import deleteCard from "./deleteCard";

const cards = new Elysia().group("/:id/cards", (app) =>
	app.use(getCards).use(getCard).use(postCard).use(patchCard).use(deleteCard),
);

export default cards;

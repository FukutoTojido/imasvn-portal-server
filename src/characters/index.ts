import { Elysia } from "elysia";
import getCharacters from "./getCharacters";
import getCharacter from "./getCharacter";

const characters = new Elysia({ prefix: "characters" })
	.use(getCharacters)
	.use(getCharacter);

export default characters;

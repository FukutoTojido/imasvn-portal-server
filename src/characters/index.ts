import { Elysia } from "elysia";
import getCharacters from "./getCharacters";
import getCharacter from "./getCharacter";
import patchCharacter from "./patchCharacter";
import deleteCharacter from "./deleteCharacter";

const characters = new Elysia({ prefix: "characters" })
	.use(getCharacters)
	.use(getCharacter)
	.use(patchCharacter)
	.use(deleteCharacter);

export default characters;

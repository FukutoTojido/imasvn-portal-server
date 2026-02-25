import { Elysia } from "elysia";
import deleteCharacter from "./deleteCharacter";
import getCharacter from "./getCharacter";
import getCharacters from "./getCharacters";
import patchCharacter from "./patchCharacter";

const characters = new Elysia({
	prefix: "characters",
	detail: { tags: ["Characters"] },
})
	.use(getCharacters)
	.use(getCharacter)
	.use(patchCharacter)
	.use(deleteCharacter);

export default characters;

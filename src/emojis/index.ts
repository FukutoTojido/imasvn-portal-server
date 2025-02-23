import { Elysia } from "elysia";
import getEmojis from "./getEmojis";
import getEmoji from "./getEmoji";

const emojis = new Elysia({ prefix: "/emojis" }).use(getEmojis).use(getEmoji);

export default emojis;

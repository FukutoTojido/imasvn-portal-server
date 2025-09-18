import { Elysia } from "elysia";
import { getConnection } from "../connection";


const getCharacters = new Elysia().get(
	"/",
	async ({ error }) => {
		try {
			const characters = await getConnection().query("SELECT * FROM idols");
			return characters;
		} catch (e) {
			console.error(e);
			return error(500, "Internal Server Error");
		}
	},
	{
		detail: {
			tags: ["Characters"],
		},
	},
);

export default getCharacters;

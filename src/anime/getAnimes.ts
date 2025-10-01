import { Elysia } from "elysia";
import { getConnection } from "../connection";

const getAnimes = new Elysia().get("/", async ({ status }) => {
	try {
		const anime = await getConnection().query(`SELECT * FROM anime ORDER BY time DESC`);
		return anime;
	} catch (e) {
		console.error(e);
		return status(500, "Internal Server Error");
	}
});

export default getAnimes;

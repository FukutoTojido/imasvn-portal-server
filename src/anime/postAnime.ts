import { Elysia } from "elysia";
import { getConnection } from "../connection";

const postAnime = new Elysia().post("/", async ({ status }) => {
	try {
		const anime = await getConnection().query("INSERT INTO `anime` VALUES ()");
        return Number(anime.insertId);
	} catch (e) {
		console.error(e);
		return status(500, "Internal Server Error");
	}
});

export default postAnime;

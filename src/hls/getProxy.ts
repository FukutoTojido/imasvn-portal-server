import { Elysia } from "elysia";
import { getConnection } from "../connection";
import { token } from "../middleware";

const getProxy = new Elysia().use(token).get("/proxy", async ({ status }) => {
	const [entry] = await getConnection().query(`SELECT * FROM (hls_url)`);

	if (!entry?.m3u8) {
		return status(404, "Not Found");
	}

	return entry.m3u8;
});

export default getProxy;

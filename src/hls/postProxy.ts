import { Elysia, t } from "elysia";
import { getConnection } from "../connection";
import { privillage } from "../middleware";

const postProxy = new Elysia().use(privillage).post(
	"/proxy",
	async ({ body: { url }, status }) => {
		try {
			await getConnection().query("UPDATE `hls_url` SET m3u8=?", [url]);
			return "Success";
		} catch (e) {
			console.error(e);
			return status(500, "Internal Server Error");
		}
	},
	{
		body: t.Object({
			url: t.String(),
		}),
	},
);

export default postProxy;

import { Elysia } from "elysia";
import { getConnection } from "../connection";

const getPreview = new Elysia().get(
	"/preview",
	async ({ status }) => {
		try {
			const [previewData] = await getConnection().query(
				"SELECT * FROM (preview)",
			);

			const [entry] = await getConnection().query(`SELECT * FROM (hls_url)`);

			if (!previewData) return status(500, "Internal Server Error");
			return { ...previewData, m3u8: entry?.m3u8 };
		} catch (e) {
			console.error(e);
			return status(500, "Internal Server Error");
		}
	},
	{
		detail: {
			tags: ["Live"],
		},
	},
);

export default getPreview;

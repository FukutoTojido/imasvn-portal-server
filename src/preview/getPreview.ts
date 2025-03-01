import { Elysia } from "elysia";
import { getConnection } from "../connection";

const getPreview = new Elysia().get(
	"/preview",
	async ({ error }) => {
		try {
			const [previewData] = await getConnection().query(
				"SELECT * FROM (preview)",
			);

			if (!previewData) return error(500, "Internal Server Error");
			return previewData;
		} catch (e) {
			console.error(e);
			return error(500, "Internal Server Error");
		}
	},
	{
		detail: {
			tags: ["Live"],
		},
	},
);

export default getPreview;

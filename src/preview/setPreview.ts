import { Elysia, t } from "elysia";
import { getConnection } from "../connection";

const setPreview = new Elysia().post(
	"/preview",
	async ({ body: { title, url }, status }) => {
		try {
			await getConnection().query("UPDATE `preview` SET title=?, url=?", [
				title,
				url,
			]);
			return "Success";
		} catch (e) {
			console.error(e);
			return status(500, "Internal Server Error");
		}
	},
	{
		body: t.Object({
			title: t.String(),
			url: t.String(),
		}),
		detail: {
			tags: ["Live"],
		},
	},
);

export default setPreview;

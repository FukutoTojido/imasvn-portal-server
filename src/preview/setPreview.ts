import { Elysia, t } from "elysia";
import { getConnection } from "../connection";

const setPreview = new Elysia().post(
	"/preview",
	async ({ body: { title, url }, cookie: { refresh_token }, error }) => {
		try {
			await getConnection().query("UPDATE `preview` SET title=?, url=?", [
				title,
				url,
			]);
			return "Success";
		} catch (e) {
			console.error(e);
			return error(500, "Internal Server Error");
		}
	},
	{
		body: t.Object({
			title: t.String(),
			url: t.String(),
		}),
		cookie: t.Object({
			refresh_token: t.Optional(t.String()),
		}),

		detail: {
			tags: ["Live"],
		},
	},
);

export default setPreview;

import { Elysia, t } from "elysia";
import { getConnection } from "../connection";
import { getImageUrl } from "../posts/postPost";

const postEvent = new Elysia().post(
	"/",
	async ({ body: { name, startDate, endDate, img }, error }) => {
		try {
			await getConnection().query(
				`INSERT INTO events (name, startDate, endDate) VALUES (?, ?, ?)`,
				[name, startDate, endDate],
			);

			const [{id}] = await getConnection().query(
				"SELECT MAX(id) as `id` FROM events",
			);
			if (!id) return error(500, "Internal Server Error");

			const imgUrl = await getImageUrl({
				file: img,
				uid: id,
				fileNameOverwrite: `events-${id}`,
			});
			await getConnection().query(`UPDATE events SET img=? WHERE id=?`, [
				imgUrl,
				id,
			]);

			return true;
		} catch (e) {
			console.error(e);
			return error(500, "Internal Server Error");
		}
	},
	{
		body: t.Object({
			name: t.String(),
			startDate: t.Date(),
			endDate: t.Date(),
			img: t.File(),
		}),
		detail: {
			tags: ["Events"],
		},
	},
);

export default postEvent;

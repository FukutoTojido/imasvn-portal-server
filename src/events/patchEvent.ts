import { Elysia, t } from "elysia";
import { getConnection } from "../connection";
import { getImageUrl } from "../posts/postPost";

const patchEvent = new Elysia().patch(
	"/:id",
	async ({
		params: { id },
		body: { name, startDate, endDate, img },
		error,
	}) => {
		try {
			const [event] = await getConnection().query(
				`SELECT * FROM events WHERE id=?`,
				[id],
			);

			if (!event) return error(404, "Event Not Found");

			const imgUrl = img
				? await getImageUrl({
						file: img,
						uid: id.toString(),
						fileNameOverwrite: `events-${id}`,
					})
				: event.img;

			await getConnection().query(
				`UPDATE events SET name=?, startDate=?, endDate=?, img=? WHERE id=?`,
				[
					name ?? event.name,
					startDate ?? event.startDate,
					endDate ?? event.endDate,
					imgUrl,
					id,
				],
			);

			return true;
		} catch (e) {
			console.error(e);
			return error(500, "Internal Server Error");
		}
	},
	{
		params: t.Object({
			id: t.Number(),
		}),
		body: t.Object({
			name: t.Optional(t.String()),
			startDate: t.Optional(t.Date()),
			endDate: t.Optional(t.Date()),
			img: t.Optional(t.File()),
		}),
		detail: {
			tags: ["Events"],
		},
	},
);

export default patchEvent;

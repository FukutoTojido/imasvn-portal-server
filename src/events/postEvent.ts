import { Elysia, t } from "elysia";
import { getConnection } from "../connection";
import { getImageUrl } from "../posts/postPost";
import { checkPrivillage } from "../middleware";

const postEvent = new Elysia().post(
	"/",
	async ({ body: { name, startDate, endDate, img, ...rest }, error }) => {
		try {
			await getConnection().query(
				`INSERT INTO events (name, startDate, endDate) VALUES (?, ?, ?)`,
				[name, startDate, endDate],
			);

			const [{ id }] = await getConnection().query(
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

			const participants = rest["participants[]"]
				? Array.isArray(rest["participants[]"])
					? rest["participants[]"]
					: [rest["participants[]"]]
				: [];

			if (participants.length)
				await getConnection().batch(
					`INSERT INTO eventParticipants (eventId, pid) VALUES (?, ?)`,
					participants.map((participant) => [id, participant]),
				);

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
			"participants[]": t.Optional(t.Union([t.String(), t.Array(t.String())])),
		}),
		detail: {
			tags: ["Events"],
		},
		async beforeHandle({ cookie, error }) {
			if (!(await checkPrivillage(cookie.refresh_token.value)))
				return error(401, "Unauthorized");
		},
	},
);

export default postEvent;

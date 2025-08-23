import { Elysia, t } from "elysia";
import { getConnection } from "../connection";
import { getImageUrl } from "../posts/postPost";
import { checkPrivillage } from "../middleware";

const patchEvent = new Elysia().patch(
	"/:id",
	async ({
		params: { id },
		body: { name, startDate, endDate, img, ...rest },
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

			const participants = rest["participants[]"]
				? Array.isArray(rest["participants[]"])
					? rest["participants[]"]
					: [rest["participants[]"]]
				: [];

			const previousParticipants = await getConnection().query(
				`SELECT pid FROM eventParticipants WHERE eventId=?`,
				[id],
			);
			const previousSet = new Set(
				previousParticipants.map(
					(participant: { pid: string }) => participant.pid,
				),
			);
			const currentSet = new Set(participants);

			const removed = previousSet.difference(currentSet);
			if (removed.size)
				await getConnection().batch(
					`DELETE FROM eventParticipants WHERE eventId=? AND pid=?`,
					[...removed].map((pid) => [id, pid]),
				);

			if (currentSet.size)
				await getConnection().batch(
					`INSERT IGNORE INTO eventParticipants (eventId, pid) VALUES (?, ?)`,
					participants.map((participant) => [id, participant]),
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

export default patchEvent;

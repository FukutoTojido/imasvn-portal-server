import { Elysia, t } from "elysia";
import { getConnection } from "../connection";

const getProducer = new Elysia().get(
	"/:id",
	async ({ params: { id }, error }) => {
		try {
			const [producer] = await getConnection().query(
				`SELECT id, name FROM producer_id WHERE id=?`,
				[id],
			);
			const [events] = await getConnection().query(
				`SELECT COUNT(eventId) as events FROM eventParticipants WHERE pid=?`,
				[id],
			);
			if (!producer) return error(404, "Not Found");

			return {
				...producer,
				events: Number(events ?? 0),
			};
		} catch (e) {
			console.error(e);
			error(500, "Internal Server Error");
		}
	},
	{
		params: t.Object({
			id: t.String(),
		}),
		detail: {
			tags: ["Producer ID"],
		},
	},
);

export default getProducer;

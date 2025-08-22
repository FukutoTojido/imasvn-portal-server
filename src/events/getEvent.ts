import { Elysia, t } from "elysia";
import { getConnection } from "../connection";

const getEvent = new Elysia().get(
	"/:id",
	async ({ params: { id }, error }) => {
		try {
			const [event] = await getConnection().query(
				`SELECT * FROM events WHERE id=?`,
				[id],
			);
			if (!event) return error(404, "Event Not Found");

			return event;
		} catch (e) {
			console.error(e);
			return error(500, "Internal Server Error");
		}
	},
	{
		params: t.Object({
			id: t.Number(),
		}),
		detail: {
			tags: ["Events"],
		},
	},
);

export default getEvent;

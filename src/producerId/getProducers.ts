import { Elysia, t } from "elysia";
import { getConnection } from "../connection";

const getProducers = new Elysia().get(
	"/",
	async ({ query: { offset = 0 }, error }) => {
		try {
			const producers = await getConnection().query(
				`SELECT id, name FROM producer_id ORDER BY name`,
			);
			return producers;
		} catch (e) {
			console.error(e);
			error(500, "Internal Server Error");
		}
	},
	{
		query: t.Object({
			offset: t.Optional(t.Number()),
		}),
		detail: {
			tags: ["Producer ID"],
		},
	},
);

export default getProducers;

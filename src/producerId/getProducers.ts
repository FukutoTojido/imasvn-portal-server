import { Elysia } from "elysia";
import { getConnection } from "../connection";

const getProducers = new Elysia().get(
	"/",
	async ({ error }) => {
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
		detail: {
			tags: ["Producer ID"],
		},
	},
);

export default getProducers;

import { Elysia } from "elysia";
import { getConnection } from "../connection";
import { checkPrivillage } from "../middleware";

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
		async beforeHandle({ cookie, error }) {
			if (!(await checkPrivillage(cookie.refresh_token.value)))
				return error(401, "Unauthorized");
		},
	},
);

export default getProducers;

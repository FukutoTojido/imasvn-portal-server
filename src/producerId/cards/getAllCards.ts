import { Elysia, t } from "elysia";
import { getConnection } from "../../connection";

const getAllCards = new Elysia().get(
	"/",
	async ({ status }) => {
		try {
			const cards = await getConnection().query(
				`SELECT * FROM cards`,
				[],
			);
			return cards;
		} catch (e) {
			console.error(e);
			return status(500, "Internal Server Error");
		}
	},
	{
		detail: {
			tags: ["Card"],
		},
	},
);

export default getAllCards;

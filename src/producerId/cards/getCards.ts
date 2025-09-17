import { Elysia, t } from "elysia";
import { getConnection } from "../../connection";
import { checkPrivillage } from "../../middleware";

const getCards = new Elysia().get(
	"/",
	async ({ params: { id }, error }) => {
		try {
			const cards = await getConnection().query(
				`SELECT * FROM cards WHERE pid=?`,
				[id],
			);
			return cards;
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
			tags: ["Card"],
		},
	},
);

export default getCards;

import { Elysia, t } from "elysia";
import { getConnection } from "../../connection";

const getCard = new Elysia().get(
	"/:cid",
	async ({ params: { cid }, error }) => {
		try {
			const [card] = await getConnection().query(
				`SELECT * FROM cards WHERE id=?`,
				[cid],
			);
			return card;
		} catch (e) {
			console.error(e);
			error(500, "Internal Server Error");
		}
	},
	{
		params: t.Object({
			id: t.String(),
			cid: t.String(),
		}),
		detail: {
			tags: ["Card"],
		},
	},
);

export default getCard;

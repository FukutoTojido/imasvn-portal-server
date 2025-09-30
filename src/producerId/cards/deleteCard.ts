import { Elysia, t } from "elysia";
import { getConnection } from "../../connection";

const deleteCard = new Elysia().delete(
	"/:cid",
	async ({ params: { cid }, status }) => {
		try {
			await getConnection().query(`DELETE FROM cards WHERE id=?`, [cid]);
			return true;
		} catch (e) {
			console.error(e);
			return status(500, "Internal Server Error");
		}
	},
	{
		params: t.Object({
			id: t.String(),
			cid: t.String(),
		}),
		detail: {
			tags: ["Producer ID"],
		},
	},
);

export default deleteCard;

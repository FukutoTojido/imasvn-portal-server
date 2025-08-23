import { Elysia, t } from "elysia";
import { getConnection } from "../../connection";
import { checkPrivillage } from "../../middleware";

const deleteCard = new Elysia().delete(
	"/:cid",
	async ({ params: { cid }, error }) => {
		try {
			await getConnection().query(`DELETE FROM cards WHERE id=?`, [cid]);
			return true;
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
			tags: ["Producer ID"],
		},
		async beforeHandle({ cookie, error }) {
			if (!(await checkPrivillage(cookie.refresh_token.value)))
				return error(401, "Unauthorized");
		},
	},
);

export default deleteCard;

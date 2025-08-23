import { Elysia, t } from "elysia";
import { getConnection } from "../connection";
import { checkPrivillage } from "../middleware";

const deleteProducer = new Elysia().delete(
	"/:id",
	async ({ params: { id }, error }) => {
		try {
			await getConnection().query(`DELETE FROM producer_id WHERE id=?`, [id]);
			return true;
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
		async beforeHandle({ cookie, error }) {
			if (!(await checkPrivillage(cookie.refresh_token.value)))
				return error(401, "Unauthorized");
		},
	},
);

export default deleteProducer;

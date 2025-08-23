import { Elysia, t } from "elysia";
import { getConnection } from "../connection";
import { checkPrivillage } from "../middleware";

const deleteEvent = new Elysia().delete(
	"/:id",
	async ({ params: { id }, error }) => {
		try {
			await getConnection().query(`DELETE FROM events WHERE id=?`, [id]);
			return true;
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
		async beforeHandle({ cookie, error }) {
			if (!(await checkPrivillage(cookie.refresh_token.value)))
				return error(401, "Unauthorized");
		},
	},
);

export default deleteEvent;

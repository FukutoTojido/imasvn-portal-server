import { Elysia, t } from "elysia";
import { getConnection } from "../connection";
import { ROLE } from "../types";

const patchUserRole = new Elysia().patch(
	"/:id/roles",
	async ({ params: { id }, body: { role }, error }) => {
		try {
			await getConnection().query("UPDATE users SET role=? WHERE id=?", [
				role,
				id,
			]);
			return true;
		} catch (e) {
			console.error(e);
			return error(500, "Internal Server Error");
		}
	},
	{
		params: t.Object({
			id: t.String(),
		}),
		body: t.Object({
			role: t.Enum(ROLE),
		}),
		detail: {
			tags: ["Users"],
		},
	},
);

export default patchUserRole;

import { Elysia, t } from "elysia";
import { checkPrivillage } from "../middleware";
import { ROLE } from "../types";
import { getConnection } from "../connection";

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
		async beforeHandle({ cookie, error }) {
			if (!(await checkPrivillage(cookie.refresh_token.value)))
				return error(401, "Unauthorized");
		},
		detail: {
			tags: ["Users"],
		},
	},
);

export default patchUserRole;

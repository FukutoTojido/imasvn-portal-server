import { Elysia, t } from "elysia";
import { getConnection } from "../connection";

const patchUserPID = new Elysia().patch(
	"/:id/pid",
	async ({ params: { id }, body: { pid }, status }) => {
		try {
			await getConnection().query("UPDATE users SET pid=? WHERE id=?", [
				pid,
				id ?? null,
			]);
			return true;
		} catch (e) {
			console.error(e);
			return status(500, "Internal Server Error");
		}
	},
	{
		params: t.Object({
			id: t.String(),
		}),
		body: t.Object({
			pid: t.Optional(t.Union([t.String(), t.Null()])),
		}),
		detail: {
			tags: ["Users"],
		},
	},
);

export default patchUserPID;

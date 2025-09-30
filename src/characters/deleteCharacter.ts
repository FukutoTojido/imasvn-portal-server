import { Elysia, t } from "elysia";
import { privillage } from "../middleware";
import { getConnection } from "../connection";

const deleteCharacter = new Elysia().use(privillage).delete(
	"/:id",
	async ({ params: { id }, status }) => {
		try {
			const [idol] = await getConnection().query(
				"SELECT id FROM idols WHERE id=?",
				[id],
			);
			if (!idol) {
				return status(404, "Not Found");
			}

			await getConnection().query("DELETE FROM idols WHERE id=?", [id]);
			return "Success";
		} catch (e) {
			console.error(e);
			return status(500, "Internal Server Error");
		}
	},
	{
		params: t.Object({
			id: t.String(),
		}),
	},
);

export default deleteCharacter;

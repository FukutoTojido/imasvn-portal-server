import { Elysia, t } from "elysia";
import { getConnection } from "../connection";

const deleteAnime = new Elysia().delete(
	"/:id",
	async ({ params: { id }, status }) => {
		try {
			const [anime] = await getConnection().query(
				`SELECT * FROM anime WHERE id=?`,
				[id],
			);
			if (!anime) return status(404, "Not Found");

			await getConnection().query(`DELETE FROM anime WHERE id=?`, [id]);

			return "Success";
		} catch (e) {
			console.error(e);
			return status(500, "Internal Server Error");
		}
	},
	{
		params: t.Object({
			id: t.Number(),
		}),
	},
);

export default deleteAnime;

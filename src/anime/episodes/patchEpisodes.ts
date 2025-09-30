import { Elysia, t } from "elysia";
import { getConnection } from "../../connection";

const patchEpisodes = new Elysia().patch(
	"/",
	async ({ body: { order }, status }) => {
		try {
			await getConnection().batch(
				`UPDATE anime_episodes SET odr=? WHERE id=?`,
				order.map(({ id, ord }) => [ord, id]),
			);

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
		body: t.Object({
			order: t.Array(
				t.Object({
					id: t.Number(),
					ord: t.Number(),
				}),
			),
		}),
	},
);

export default patchEpisodes;

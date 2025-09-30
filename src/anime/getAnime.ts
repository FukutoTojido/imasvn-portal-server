import { Elysia, t } from "elysia";
import { getConnection } from "../connection";

const getAnime = new Elysia().get(
	"/:id",
	async ({ params: { id }, status }) => {
		try {
			const [anime] = await getConnection().query(
				`SELECT * FROM anime WHERE id=?`,
				[id],
			);
			const episodes = await getConnection().query(
				`SELECT * FROM anime_episodes WHERE animeId=? ORDER BY odr ASC`,
				[id],
			);
			if (!anime) return status(404, "Not Found");
			return {
				...anime,
				episodes: episodes.map(
					({ idx, ...data }: Record<string, string | number>) => ({
						...data,
						index: idx,
					}),
				),
			};
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

export default getAnime;

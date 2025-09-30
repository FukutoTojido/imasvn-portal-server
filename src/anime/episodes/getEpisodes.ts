import { Elysia, t } from "elysia";
import { getConnection } from "../../connection";

const getEpisodes = new Elysia().get(
	"/",
	async ({ params: { id }, status }) => {
		try {
			const episodes = await getConnection().query(
				"SELECT * FROM anime_episodes WHERE animeId=? ORDER BY odr ASC",
				[id],
			);

			return episodes.map(
				({ idx, ...data }: Record<string, string | number>) => ({
					...data,
					index: idx,
				}),
			);
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

export default getEpisodes;

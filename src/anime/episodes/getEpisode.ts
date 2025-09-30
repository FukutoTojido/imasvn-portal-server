import { Elysia, t } from "elysia";
import { getConnection } from "../../connection";

const getEpisode = new Elysia().get(
	"/:episode",
	async ({ params: { id, episode }, status }) => {
		try {
			const [data] = await getConnection().query(
				"SELECT * FROM anime_episodes WHERE animeId=? AND id=?",
				[id, episode],
			);

			if (!data) return status(404, "Not Found");
			const { idx, ...rest } = data;

			return {
				...rest,
				index: idx,
			};
		} catch (e) {
			console.error(e);
			return status(500, "Internal Server Error");
		}
	},
	{
		params: t.Object({
			id: t.Number(),
			episode: t.Number(),
		}),
	},
);

export default getEpisode;

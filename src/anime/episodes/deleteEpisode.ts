import { rmSync } from "node:fs";
import { Elysia, t } from "elysia";
import { getConnection } from "../../connection";

const deleteEpisode = new Elysia().delete(
	"/:episode",
	async ({ params: { id, episode }, status }) => {
		try {
			const [anime] = await getConnection().query(
				`SELECT * FROM anime_episodes WHERE id=? AND animeId=?`,
				[episode, id],
			);
			if (!anime) return status(404, "Not Found");

			rmSync(`${process.cwd()}/public/anime/${id}-${episode}`, {
				recursive: true,
				force: true,
			});

			await getConnection().query(
				`DELETE FROM anime_episodes WHERE id=? AND animeId=?`,
				[episode, id],
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
			episode: t.Number(),
		}),
	},
);

export default deleteEpisode;

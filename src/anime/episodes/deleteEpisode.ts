import { rmSync } from "node:fs";
import { Elysia, t } from "elysia";
import { getConnection } from "../../connection";
import { processQueue } from "./utils";

const deleteEpisode = new Elysia().use(processQueue).delete(
	"/:episode",
	async ({ params: { id, episode }, status, processQueue }) => {
		try {
			const [anime] = await getConnection().query(
				`SELECT * FROM anime_episodes WHERE id=? AND animeId=?`,
				[episode, id],
			);
			if (!anime) return status(404, "Not Found");

			await getConnection().query(
				`DELETE FROM anime_episodes WHERE id=? AND animeId=?`,
				[episode, id],
			);

			const key = `${id}-${episode}`;
			const pair = processQueue.get(key);
			if (pair) {
				console.log(`[ANIME][${key}]: Found running instance! Aborting...`);
				const { promise, controller } = pair;

				controller.abort();
				await promise;
			}

			rmSync(`${process.cwd()}/public/anime/${key}/`, {
				recursive: true,
				force: true,
			});

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

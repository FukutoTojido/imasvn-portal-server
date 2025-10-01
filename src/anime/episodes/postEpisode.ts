import { Elysia, t } from "elysia";
import { getConnection } from "../../connection";
import { processQueue, saveVideo } from "./utils";

const postEpisode = new Elysia().use(processQueue).post(
	"/",
	async ({
		params: { id },
		body: { title, index, video },
		status,
		processQueue,
	}) => {
		try {
			const episode = await getConnection().query(
				`INSERT INTO anime_episodes (animeId, title, idx, state) VALUES (?, ?, ?, ?)`,
				[id, title, index, 0],
			);

			const episodeId = Number(episode.insertId);

			if (video) {
				const controller = new AbortController();
				const key = `${id}-${episodeId}`;
				const promise = saveVideo(video, key, controller, async () => {
					processQueue.delete(key);

					await getConnection().query(
						`UPDATE anime_episodes SET state=? WHERE id=?`,
						[1, episodeId],
					);
				});

				processQueue.set(key, {
					controller,
					promise,
				});
			}

			return episodeId;
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
			title: t.String(),
			index: t.String(),
			video: t.File(),
		}),
	},
);

export default postEpisode;

import { Elysia, t } from "elysia";
import { getConnection } from "../../connection";
import { processQueue, saveVideo } from "./utils";

const patchEpisode = new Elysia({
	serve: {
		maxRequestBodySize: 1024 * 1024 * 300,
	},
})
	.use(processQueue)
	.patch(
		"/:episode",
		async ({
			params: { id, episode },
			body: { title, index, video },
			status,
			processQueue,
		}) => {
			try {
				const entry = await getConnection().query(
					`SELECT * FROM anime_episodes WHERE id=? AND animeId=?`,
					[episode, id],
				);
				if (!entry) return status(404, "Not Found");

				if (video) {
					const key = `${id}-${episode}`;
					const pair = processQueue.get(key);
					if (pair) {
						console.log(`[ANIME][${key}]: Found running instance! Aborting...`);
						const { promise, controller } = pair;

						controller.abort();
						await promise;
					}

					await getConnection().query(
						`UPDATE anime_episodes SET state=? WHERE id=?`,
						[0, episode],
					);

					const controller = new AbortController();
					const promise = saveVideo(video, key, controller, async () => {
						processQueue.delete(key);
						await getConnection().query(
							`UPDATE anime_episodes SET state=? WHERE id=?`,
							[1, episode],
						);
					});

					processQueue.set(key, {
						controller,
						promise,
					});
				}

				await getConnection().query(
					`UPDATE anime_episodes SET title=?, idx=? WHERE id=?`,
					[title ?? entry.title, index ?? entry.idx, episode],
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
			body: t.Object({
				title: t.Optional(t.String()),
				index: t.Optional(t.String()),
				video: t.Optional(t.File()),
			}),
		},
	);

export default patchEpisode;

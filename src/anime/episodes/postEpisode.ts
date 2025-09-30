import { Elysia, t } from "elysia";
import { getConnection } from "../../connection";
import { saveVideo } from "./utils";

const postEpisode = new Elysia({
	serve: {
		maxRequestBodySize: 1024 * 1024 * 300,
	},
}).post(
	"/",
	async ({ params: { id }, body: { title, index, video }, status }) => {
		try {
			const episode = await getConnection().query(
				`INSERT INTO anime_episodes (animeId, title, idx) VALUES (?, ?, ?)`,
				[id, title, index],
			);

			const episodeId = Number(episode.insertId);

			await saveVideo(video, `${id}-${episodeId}`);

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

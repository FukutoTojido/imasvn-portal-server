import { ListObjectsV2Command } from "@aws-sdk/client-s3";
import { Elysia, t } from "elysia";
import { getConnection } from "../../connection";
import { b0131 } from "../../lib/r2";

const getEpisode = new Elysia().get(
	"/:episode",
	async ({ params: { id, episode }, status }) => {
		try {
			const [data] = await getConnection().query(
				"SELECT * FROM anime_episodes WHERE animeId=? AND id=?",
				[id, episode],
			);

			const res = await b0131.send(
				new ListObjectsV2Command({
					Bucket: process.env.B0131_BUCKET_NAME,
					Prefix: `${process.env.B0131_CDN_PREFIX}anime/${id}/${episode}/`,
				}),
			);

			if (!data) return status(404, "Not Found");
			const { idx, ...rest } = data;

			return {
				...rest,
				index: idx,
				uploadedFiles: res.KeyCount,
			};
		} catch (e) {
			console.error((e as unknown as Record<string, unknown>).$response);
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

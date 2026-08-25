import { DeleteObjectsCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { Elysia, t } from "elysia";
import { getConnection } from "../../connection";
import { b0131 } from "../../lib/r2";
import { processQueue } from "./utils";

const deleteEpisode = new Elysia()
	.use(processQueue)
	.delete(
		"/:episode",
		async ({ params: { id, episode }, status }) => {
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

				const res = await b0131.send(
					new ListObjectsV2Command({
						Bucket: process.env.B0131_BUCKET_NAME,
						Prefix: `${process.env.B0131_CDN_PREFIX || ""}anime/${id}/${episode}/`,
					}),
				);

				const { Deleted } = await b0131.send(
					new DeleteObjectsCommand({
						Bucket: process.env.B0131_BUCKET_NAME,
						Delete: {
							Objects: res.Contents?.map((content) => ({ Key: content.Key })),
						},
					}),
				);

				return Deleted;
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
	)
	.delete(
		"/:episode/contents",
		async ({ params: { id, episode }, status }) => {
			try {
				const res = await b0131.send(
					new ListObjectsV2Command({
						Bucket: process.env.B0131_BUCKET_NAME,
						Prefix: `${process.env.B1031_CDN_PREFIX || ""}anime/${id}/${episode}/`,
					}),
				);

				const { Deleted } = await b0131.send(
					new DeleteObjectsCommand({
						Bucket: process.env.B0131_BUCKET_NAME,
						Delete: {
							Objects: res.Contents?.map((content) => ({ Key: content.Key })),
						},
					}),
				);

				return Deleted;
			} catch (e) {
				console.error(e);
				return status(500, "Internal Server Error");
			}
		},
		{
			params: t.Object({ id: t.Number(), episode: t.Number() }),
		},
	);

export default deleteEpisode;

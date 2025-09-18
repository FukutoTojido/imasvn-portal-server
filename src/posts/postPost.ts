import { SnowflakeId } from "@akashrajpurohit/snowflake-id";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Elysia, t } from "elysia";
import { getConnection } from "../connection";
import r2 from "../lib/r2";
import { token } from "../middleware";

const snowflake = SnowflakeId();
export const getImageUrl = async ({ file, uid, fileNameOverwrite }: { file: File; uid: string, fileNameOverwrite?: string }) => {
	if (!file || file.size === 0) {
		return null;
	}

	const fileName = fileNameOverwrite ?? `${uid}-${file.name}`;
	const signedUrl = await getSignedUrl(
		r2,
		new PutObjectCommand({
			Bucket: process.env.R2_BUCKET_NAME,
			Key: fileName,
		}),
		{
			expiresIn: 60,
		},
	);

	await fetch(signedUrl, {
		method: "PUT",
		body: file,
	});

	return `https://cdn.tryz.id.vn/${encodeURIComponent(fileName)}`;
};

const postPost = new Elysia().use(token).post(
	"/",
	async ({ body, error, userData }) => {
		const content = body["post-content"];
		const images = body["post-images"] ?? [];
		const uid = userData.id;
		const time = new Date();
		const postId = snowflake.generate();

		try {
			const urlsPromises = images.map((file) =>
				getImageUrl({ file: file, uid: postId }),
			);
			const urls = await Promise.all(urlsPromises);

			await getConnection().query(
				"INSERT INTO `posts` (id, content, time, user) VALUES (?, ?, ?, ?)",
				[postId, content, time, uid],
			);

			if (urls.length !== 0) {
				await getConnection().batch(
					"INSERT INTO `images` (url, postId, idx) VALUES (?, ?, ?)",
					urls.map((url, idx) => {
						// console.log([url, postId, idx]);
						return [url, postId, idx];
					}),
				);
			}

			return { postId };
		} catch (e) {
			console.error(e);
			return error(500, "Internal Server Error");
		}
	},
	{
		body: t.Object({
			"post-content": t.String(),
			"post-images": t.Optional(t.Files()),
			"post-uid": t.String(),
		}),
		detail: {
			tags: ["Posts"]
		},
	},
);

export default postPost;

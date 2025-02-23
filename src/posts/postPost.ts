import { Elysia, t } from "elysia";
import r2 from "../lib/r2";
import { getConnection } from "../connection";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { SnowflakeId } from "@akashrajpurohit/snowflake-id";
import checkToken from "../middleware";

const snowflake = SnowflakeId();
const getImageUrl = async ({ file, uid }: { file: File; uid: string }) => {
	if (!file || file.size === 0) {
		return null;
	}

	const fileName = `${uid}-${file.name}`;
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

const postPost = new Elysia().post(
	"/",
	async ({ body, error }) => {
		const content = body["post-content"];
		const images = body["post-images"] ?? [];
		const uid = body["post-uid"];
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

			return postId;
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
		async beforeHandle({ cookie, error }) {
			if (!(await checkToken(cookie.refresh_token.value)))
				return error(401, "Unauthorized");
		}
	},
);

export default postPost;

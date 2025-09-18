import { Elysia, t } from "elysia";
import { getConnection } from "../connection";
import r2 from "../lib/r2";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import md5 from "md5";

const deletePost = new Elysia().delete(
	"/:id",
	async ({ params: { id }, cookie: { refresh_token }, error }) => {
		try {
			const [post] = await getConnection().query(
				"SELECT * FROM posts WHERE id=?",
				[id],
			);
			if (!post) return error(404, "Post Not Found");

			const [hashed] = await getConnection().query(
				"SELECT (hash) FROM hash_token WHERE uid=?",
				[post.user],
			);

			if (
				!hashed ||
				!refresh_token.value ||
				hashed.hash !== md5(refresh_token.value)
			) {
				return error(403, "Forbidden");
			}

			const images = await getConnection().query(
				"SELECT (url) FROM images WHERE postId=?",
				[id],
			);

			for (const image of images) {
				await r2.send(
					new DeleteObjectCommand({
						Bucket: process.env.R2_BUCKET_NAME,
						Key: image.url.replaceAll("https://cdn.tryz.id.vn/", ""),
					}),
				);
			}

			await getConnection().query("DELETE FROM `images` WHERE postId=?", [id]);

			await getConnection().query("DELETE FROM `comments` WHERE postId=?", [
				id,
			]);

			await getConnection().query("DELETE FROM `posts` WHERE id=?", [id]);

			return "Success";
		} catch (e) {
			console.error(e);
			return error(500, "Internal Server Error");
		}
	},
	{
		params: t.Object({
			id: t.String(),
		}),
		cookie: t.Object({
			refresh_token: t.Optional(t.String()),
		}),
		detail: {
			tags: ["Posts"],
		},
	},
);

export default deletePost;

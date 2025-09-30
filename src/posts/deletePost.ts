import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { Elysia, t } from "elysia";
import { getConnection } from "../connection";
import r2 from "../lib/r2";
import { token } from "../middleware";

const deletePost = new Elysia().use(token).delete(
	"/:id",
	async ({ params: { id }, status }) => {
		try {
			const [post] = await getConnection().query(
				"SELECT * FROM posts WHERE id=?",
				[id],
			);
			if (!post) return status(404, "Post Not Found");

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
			return status(500, "Internal Server Error");
		}
	},
	{
		params: t.Object({
			id: t.String(),
		}),
		detail: {
			tags: ["Posts"],
		},
	},
);

export default deletePost;

import { Elysia, t } from "elysia";
import { getConnection } from "../connection";

const getPost = new Elysia().get(
	"/:id",
	async ({ params: { id }, status }) => {
		try {
			const [post] = await getConnection().query(
				"SELECT * FROM posts WHERE id=?",
				[id],
			);
			if (!post) return status(404, "Post Not Found");

			const images = await getConnection().query(
				"SELECT (url) FROM images WHERE postId=? ORDER BY idx ASC",
				[id],
			);

			const [user] = await getConnection().query(
				"SELECT * FROM `users` WHERE id=?",
				[post.user],
			);

			const [commentsCount] = await getConnection().query(
				"SELECT COUNT(id) FROM `comments` WHERE postId=?",
				[id],
			);

			return {
				id: id,
				user: {
					id: user.id,
					name: user.username,
					tag: user.tag,
					avatar: user.avatar,
				},
				time: post.time,
				content: post.content,
				commentsCount: commentsCount["COUNT(id)"].toString(),
				images,
			};
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
			tags: ["Posts"]
		}
	},
);

export default getPost;

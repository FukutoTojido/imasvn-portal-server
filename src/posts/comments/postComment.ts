import { SnowflakeId } from "@akashrajpurohit/snowflake-id";
import { Elysia, t } from "elysia";
import { getConnection } from "../../connection";
import { token } from "../../middleware";

const snowflake = SnowflakeId();
const postComment = new Elysia().use(token).post(
	"/:id/comments",
	async ({ body, params: { id }, error, userData }) => {
		try {
			const [post] = await getConnection().query(
				"SELECT * FROM posts WHERE id=?",
				[id],
			);
			if (!post) return error(404, "Post Not Found");

			const content = body["comment-content"];
			const commentId = snowflake.generate();
			const time = new Date();

			await getConnection().query(
				"INSERT INTO `comments` (id, postDate, postId, userId, content) VALUES (?, ?, ?, ?, ?)",
				[commentId, time, id, userData.id, content],
			);

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
		body: t.Object({
			"comment-content": t.String(),
		}),
		cookie: t.Object({
			refresh_token: t.Optional(t.String()),
		}),
		detail: {
			tags: ["Posts"],
		},
	},
);

export default postComment;

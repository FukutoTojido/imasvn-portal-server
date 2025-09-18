import { SnowflakeId } from "@akashrajpurohit/snowflake-id";
import { Elysia, t } from "elysia";
import { getConnection } from "../../connection";
import md5 from "md5";

const snowflake = SnowflakeId();
const postComment = new Elysia().post(
	"/:id/comments",
	async ({ body, params: { id }, error, cookie }) => {
		try {
			const [post] = await getConnection().query(
				"SELECT * FROM posts WHERE id=?",
				[id],
			);
			if (!post) return error(404, "Post Not Found");

			const [user] = await getConnection().query(
				"SELECT (uid) from hash_token WHERE hash=?",
				[md5(cookie.refresh_token.value ?? "")],
			);
			if (!user) return error(401, "Unauthorized");

			const content = body["comment-content"];
			const commentId = snowflake.generate();
			const time = new Date();

			await getConnection().query(
				"INSERT INTO `comments` (id, postDate, postId, userId, content) VALUES (?, ?, ?, ?, ?)",
				[commentId, time, id, user.uid, content],
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

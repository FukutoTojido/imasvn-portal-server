import { Elysia, t } from "elysia";
import { getConnection } from "../../connection";
import md5 from "md5";

const deleteComment = new Elysia().delete(
	"/:commentId",
	async ({ params: { id, commentId }, cookie, error }) => {
		const [comment] = await getConnection().query(
			"SELECT * FROM `comments` WHERE id=?",
			[commentId],
		);
		if (!comment) return error(404, "Not Found");

		const [user] = await getConnection().query(
			"SELECT (uid) FROM `hash_token` WHERE hash=?",
			[md5(cookie.refresh_token.value ?? "")],
		);
		if (!user || user.uid !== comment.userId) return error(403, "Forbidden");

		await getConnection().query("DELETE FROM `comments` WHERE id=?", [
			commentId,
		]);

		return "Success";
	},
	{
		params: t.Object({
			id: t.String(),
			commentId: t.String(),
		}),
		cookie: t.Object({
			refresh_token: t.Optional(t.String()),
		}),
		detail: {
			tags: ["Posts"],
		},
	},
);

export default deleteComment;

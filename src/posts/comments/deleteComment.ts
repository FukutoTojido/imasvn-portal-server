import { Elysia, t } from "elysia";
import { getConnection } from "../../connection";
import { token } from "../../middleware";

const deleteComment = new Elysia().use(token).delete(
	"/:commentId",
	async ({ params: { commentId }, userData, error }) => {
		const [comment] = await getConnection().query(
			"SELECT * FROM `comments` WHERE id=?",
			[commentId],
		);
		if (!comment) return error(404, "Not Found");

		if (userData.id !== comment.userId) return error(403, "Forbidden");

		await getConnection().query("DELETE FROM `comments` WHERE id=?", [
			commentId,
		]);

		return "Success";
	},
	{
		params: t.Object({
			id: t.Optional(t.String()),
			commentId: t.String(),
		}),
		detail: {
			tags: ["Posts"],
		},
	},
);

export default deleteComment;

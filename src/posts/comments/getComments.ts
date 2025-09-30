import { Elysia, t } from "elysia";
import { getConnection } from "../../connection";

const getComments = new Elysia().get(
	"/",
	async ({ params: { id }, query: { offset }, status }) => {
		try {
			const [post] = await getConnection().query(
				"SELECT * FROM posts WHERE id=?",
				[id],
			);
			if (!post) return status(404, "Post Not Found");

			offset = (offset ?? 1) - 1;
			const comments = await getConnection().query(
				`SELECT * 
                FROM \`comments\` 
			    JOIN
    			(SELECT id as uid, avatar, username, tag FROM users) as users
    			ON users.uid=comments.userId
			WHERE postId=? 
			ORDER BY postDate DESC LIMIT ?, ?`,
				[id, offset * 5, 5 + offset * 5],
			);

			return comments.map(
				(comment: {
					id: string;
					postDate: string;
					postId: string;
					content: string;
					uid: string;
					avatar: string;
					username: string;
					tag: string;
				}) => {
					return {
						id: comment.id,
						postDate: comment.postDate,
						postId: comment.postId,
						content: comment.content,
						user: {
							id: comment.uid,
							avatar: comment.avatar,
							name: comment.username,
							tag: comment.tag,
						},
					};
				},
			);
		} catch (e) {
			console.error(e);
			return status(500, "Internal Server Error");
		}
	},
	{
		params: t.Object({
			id: t.String(),
		}),
		query: t.Object({
			offset: t.Optional(t.Number()),
		}),
		detail: {
			tags: ["Posts"],
		},
	},
);

export default getComments;

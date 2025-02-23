import { Elysia, t } from "elysia";
import { getConnection } from "../connection";

const getUserPosts = new Elysia().get(
	"/:id/posts",
	async ({ params: { id }, query: { offset }, error }) => {
		try {
			offset = Math.max(0, (offset ?? 1) - 1);
			const posts = await getConnection().query(
				`SELECT * 
                FROM posts 
                    JOIN 
                        (SELECT id as userId, avatar, username, tag FROM users) as users 
                    ON users.userId=posts.user
                    LEFT JOIN
                         (SELECT postId, COUNT(id) as commentsCount FROM \`comments\` GROUP BY postId) as comments_count
                    ON comments_count.postId = posts.id
                WHERE user=? 
                ORDER BY time DESC LIMIT ?, ?`,
				[id, offset * 5, 5 + offset * 5],
			);

			if (!posts) return error(404, "User Not Found");

			const parsed = [];
			for (const post of posts) {
				const images = await getConnection().query(
					"SELECT (url) FROM images WHERE postId=? ORDER BY idx ASC",
					[post.id],
				);

				parsed.push({
					id: post.id,
					user: {
						id: post.user,
						name: post.username,
						tag: post.tag,
						avatar: post.avatar,
					},
					time: post.time,
					content: post.content,
					commentsCount: (post.commentsCount ?? "0").toString(),
					images,
				});
			}

			return parsed;
		} catch (e) {
			console.error(e);
			error(500, "Internal Server Error");
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
			tags: ["Users"]
		}
	},
);

export default getUserPosts;

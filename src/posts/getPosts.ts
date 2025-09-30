import { Elysia, t } from "elysia";
import { getConnection } from "../connection";

const getPosts = new Elysia().get(
	"/",
	async ({ query: { offset }, status }) => {
		try {
			offset = (offset ?? 1) - 1;

			const res = await getConnection().query(
				`
				SELECT * 
				FROM posts 
					LEFT JOIN 
						(SELECT postId, COUNT(id) as commentsCount FROM \`comments\` GROUP BY postId) as comments_count 
					ON comments_count.postId = posts.id 
					JOIN 
						(SELECT id as userId, avatar, username, tag FROM users) as users 
					ON users.userId = posts.user
				ORDER BY time DESC LIMIT ?, ?`,
				[offset * 5, 5 + offset * 5],
			);

			const posts = [];
			for (const post of res) {
				const images = await getConnection().query(
					"SELECT (url) FROM images WHERE postId=? ORDER BY idx ASC",
					[post.id],
				);

				posts.push({
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

			return posts;
		} catch (e) {
			console.error(e);
			return status(500, "Internal Server Error");
		}
	},
	{
		query: t.Object({
			offset: t.Optional(t.Number()),
			timemark: t.Optional(t.Number()),
		}),
		detail: {
			tags: ["Posts"]
		}
	},
);

export default getPosts;

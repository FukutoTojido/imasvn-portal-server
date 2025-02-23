import { Elysia, t } from "elysia";
import { getMongoConntection } from "../connection";

const getEmojis = new Elysia().get(
	"/",
	async ({ query: { query }, error }) => {
		try {
			const db = getMongoConntection().db(process.env.MONGO_DB);
			const collection = db.collection("emojis");

			const emojis = collection.find(
				!query
					? {}
					: {
							name: {
								$regex: query,
								$options: "i",
							},
						},
				{
					projection: {
						_id: false,
					},
				},
			);

			return await emojis
				.sort({
					name: 1,
				})
				.toArray();
		} catch (e) {
			console.error(e);
			return error(500, "Internal Server Error");
		}
	},
	{
		query: t.Object({
			query: t.Optional(t.String()),
		}),
		detail: {
			tags: ["Emojis"]
		}
	},
);

export default getEmojis;

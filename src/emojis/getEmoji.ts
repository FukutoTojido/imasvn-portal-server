import { Elysia, t } from "elysia";
import { getMongoConnection } from "../connection";

const getEmoji = new Elysia().get(
	"/:name",
	async ({ params: { name }, error, redirect }) => {
		try {
			const db = getMongoConnection().db(process.env.MONGO_DB);
			const collection = db.collection("emojis");

			const emoji = await collection.findOne(
				{
					name,
				},
				{
					projection: {
						_id: 0,
					},
				},
			);

			if (!emoji) return error(404, "Emoji Not Found");
			if (emoji.id[0] === "-") {
				const collection = db.collection("custom-emojis");
				const negaEmoji = await collection.findOne(
					{
						id: emoji.id,
					},
					{
						projection: {
							_id: 0,
						},
					},
				);

				if (!negaEmoji) return error(404, "Emoji Not Found");
				return redirect(negaEmoji.url);
			}

			return redirect(`https://cdn.discordapp.com/emojis/${emoji.id}`);
		} catch (e) {
			console.error(e);
			return error(500, "Internal Server Error");
		}
	},
	{
		params: t.Object({
			name: t.String(),
		}),
		detail: {
			tags: ["Emojis"]
		}
	},
);

export default getEmoji;

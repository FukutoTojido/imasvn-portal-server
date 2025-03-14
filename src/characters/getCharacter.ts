import { Elysia, t } from "elysia";
import { getMongoConnection } from "../connection";

const getCharacter = new Elysia().get(
	"/:id",
	async ({ params: { id }, error }) => {
		try {
			const char = await getMongoConnection()
				.db(process.env.MONGO_DB)
				.collection("characters")
				.findOne(
					{
						Index: id,
					},
					{
						projection: {
							_id: false,
						},
					},
				);

			if (!char) return error(404, "Not Found");
			return char;
		} catch (e) {
			console.error(e);
			return error(500, "Internal Server Error");
		}
	},
	{
		params: t.Object({
			id: t.Number(),
		}),
		detail: {
			tags: ["Characters"]
		}
	},
);

export default getCharacter;

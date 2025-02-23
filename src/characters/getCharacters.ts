import { Elysia, t } from "elysia";
import { getMongoConntection } from "../connection";

const monthArray = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const getCharacters = new Elysia().get(
	"/",
	async ({ query: { offset, query, month }, error }) => {
		try {
			offset = (offset ?? 1) - 1;
			month = month ?? 0;
			const monthQuery =
				month === 0
					? {}
					: {
							$or: [
								{
									"Birthday.month": monthArray.at(
										(month - 1 - 1) % monthArray.length,
									),
								},
								{
									"Birthday.month": monthArray.at(
										(month + 1 - 1) % monthArray.length,
									),
								},
								{
									"Birthday.month": month,
								},
							],
						};

			const characterQuery =
				query && query !== ""
					? {
							$or: [
								{
									Name: {
										$regex: query,
										$options: "i",
									},
								},
								{
									Character: {
										$regex: query,
										$options: "i",
									},
								},
								{
									"Voice Actor": {
										$regex: query,
										$options: "i",
									},
								},
							],
						}
					: {};

			const chars = getMongoConntection()
				.db(process.env.MONGO_DB)
				.collection("characters")
				.find(
					{
						...monthQuery,
						...characterQuery,
					},
					{
						projection: {
							_id: false,
							Name: true,
							Character: true,
							Birthday: true,
							"Image Color": true,
							"Voice Actor": true,
							Index: true,
							ImgURL: true,
						},
					},
				);

			if (month !== 0) {
				return await chars
					.sort({
						"Birthday.month": 1,
						"Birthday.day": 1,
						Character: 1,
					})
					.toArray();
			}

			return await chars
				.skip(offset * 13)
				.limit(13)
				.toArray();
		} catch (e) {
			console.error(e);
			return error(500, "Internal Server Error");
		}
	},
	{
		query: t.Object({
			offset: t.Optional(t.Number()),
			query: t.Optional(t.String()),
			month: t.Optional(t.Number()),
		}),
		detail: {
			tags: ["Characters"]
		}
	},
);

export default getCharacters;

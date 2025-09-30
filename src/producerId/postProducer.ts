import { Elysia, t } from "elysia";
import ShortUniqueId from "short-unique-id";
import { getConnection } from "../connection";

const { randomUUID } = new ShortUniqueId({
	dictionary: "alphanum_upper",
});
const postProducer = new Elysia().post(
	"/",
	async ({ body: { name }, status }) => {
		const ID = randomUUID(4);
		try {
			await getConnection().query(
				"INSERT INTO `producer_id` (id, name) VALUES (?, ?)",
				[ID, name],
			);

			return ID;
		} catch (e) {
			console.error(e);
			status(500, "Internal Server Error");
		}
	},
	{
		body: t.Object({
			name: t.String(),
		}),
		detail: {
			tags: ["Producer ID"],
		},
	},
);

export default postProducer;

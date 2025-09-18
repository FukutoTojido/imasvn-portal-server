import { Elysia, t } from "elysia";
import ShortUniqueId from "short-unique-id";
import { getConnection } from "../../connection";

const { randomUUID } = new ShortUniqueId({
	dictionary: "alphanum_upper",
});
const postCard = new Elysia().post(
	"/",
	async ({ params: { id: pid }, error }) => {
		const ID = randomUUID(16);
		try {
			const [producer] = await getConnection().query(
				`SELECT id, name FROM producer_id WHERE id=?`,
				[pid],
			);
			if (!producer) return error(404, "Producer Not Found");

			await getConnection().query(
				"INSERT INTO `cards` (id, pid, name) VALUES (?, ?, ?)",
				[ID, pid, producer.name],
			);

			return ID;
		} catch (e) {
			console.error(e);
			error(500, "Internal Server Error");
		}
	},
	{
		params: t.Object({
			id: t.String(),
		}),
		detail: {
			tags: ["Card"],
		},
	},
);

export default postCard;

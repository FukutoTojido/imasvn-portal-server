import { Elysia, t } from "elysia";
import ShortUniqueId from "short-unique-id";
import { getConnection } from "../../connection";
import { getImageUrl } from "../../posts/postPost";
import { checkPrivillage } from "../../middleware";

const { randomUUID } = new ShortUniqueId({
	dictionary: "alphanum_upper",
});
const postCard = new Elysia().post(
	"/",
	async ({ params: { id: pid }, body: { name, idol, img, title }, error }) => {
		const ID = randomUUID(16);
		try {
			const imgUrl = await getImageUrl({ file: img, uid: ID, fileNameOverwrite: ID });
			const [producer] = await getConnection().query(
				`SELECT id, name FROM producer_id WHERE id=?`,
				[pid],
			);
			if (!producer) return error(404, "Producer Not Found");

			await getConnection().query(
				"INSERT INTO `cards` (id, pid, name, idol, img, title) VALUES (?, ?, ?, ?, ?, ?)",
				[ID, pid, producer.name ?? name, idol, imgUrl, title],
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
		body: t.Object({
			name: t.Optional(t.String()),
			idol: t.String(),
			img: t.File(),
			title: t.String(),
		}),
		detail: {
			tags: ["Card"],
		},
		async beforeHandle({ cookie, error }) {
			if (!(await checkPrivillage(cookie.refresh_token.value)))
				return error(401, "Unauthorized");
		},
	},
);

export default postCard;

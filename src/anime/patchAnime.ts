import { Elysia, t } from "elysia";
import { getConnection } from "../connection";
import { getImageUrl } from "../posts/postPost";

const patchAnime = new Elysia().patch(
	"/:id",
	async ({
		params: { id },
		body: { title, titleJapanese, sypnosis, bg, time },
		status,
	}) => {
		try {
			const [anime] = await getConnection().query(
				`SELECT * FROM anime WHERE id=?`,
				[id],
			);
			if (!anime) return status(404, "Not Found");

			const bgUrl = bg
				? await getImageUrl({
						file: bg,
						uid: "",
						fileNameOverwrite: `anime-${id}`,
					})
				: null;

			await getConnection().query(
				"UPDATE `anime` SET title=?, titleJapanese=?, sypnosis=?, bg=?, time=? WHERE id=?",
				[
					title ?? anime.title,
					titleJapanese ?? anime.titleJapanese,
					sypnosis ?? anime.sypnosis,
					bgUrl ?? anime.bg,
					time ?? anime.time,
					id,
				],
			);
			return "Success";
		} catch (e) {
			console.error(e);
			return status(500, "Internal Server Error");
		}
	},
	{
		params: t.Object({ id: t.Number() }),
		body: t.Object({
			title: t.Optional(t.String()),
			titleJapanese: t.Optional(t.String()),
			sypnosis: t.Optional(t.String()),
			bg: t.Optional(t.File()),
			time: t.Optional(t.Date()),
		}),
	},
);

export default patchAnime;

import { Elysia, t } from "elysia";

import { getConnection } from "../../connection";
import { getImageUrl } from "../../posts/postPost";
import { checkPrivillage } from "../../middleware";

const patchCard = new Elysia().patch(
	"/:cid",
	async ({ params: { cid }, body: { name, idol, img, title }, error }) => {
		try {
			const [cardInfo] = await getConnection().query(
				"SELECT name, idol, img, title FROM cards WHERE id=?",
				[cid],
			);
			if (!cardInfo) return error(404, "Card not found");

			const imgUrl = img
				? await getImageUrl({ file: img, uid: cid, fileNameOverwrite: cid })
				: cardInfo.img;

			await getConnection().query(
				"UPDATE `cards` SET name=?, idol=?, img=?, title=? WHERE id=?",
				[
					name ?? cardInfo.name,
					idol ?? cardInfo.idol,
					imgUrl,
					title ?? cardInfo.title,
					cid,
				],
			);

			return cid;
		} catch (e) {
			console.error(e);
			error(500, "Internal Server Error");
		}
	},
	{
		params: t.Object({
			id: t.String(),
			cid: t.String(),
		}),
		body: t.Object({
			name: t.Optional(t.String()),
			idol: t.Optional(t.String()),
			img: t.Optional(t.File()),
			title: t.Optional(t.String()),
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

export default patchCard;

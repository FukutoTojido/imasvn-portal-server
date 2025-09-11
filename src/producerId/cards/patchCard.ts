import { Elysia, t } from "elysia";

import { getConnection } from "../../connection";
import { checkPrivillage } from "../../middleware";
import { getImageUrl } from "../../posts/postPost";

const patchCard = new Elysia().patch(
	"/:cid",
	async ({ params: { cid }, body: { name, idol, img, title, idolJapanese, frontImg, backImg, event }, error }) => {
		try {
			const [cardInfo] = await getConnection().query(
				"SELECT name, idol, img, title, frontImg, backImg, event FROM cards WHERE id=?",
				[cid],
			);
			if (!cardInfo) return error(404, "Card not found");

			const imgUrl = img
				? await getImageUrl({ file: img, uid: cid, fileNameOverwrite: cid })
				: cardInfo.img;

			const frontImgUrl = frontImg
				? await getImageUrl({ file: frontImg, uid: cid, fileNameOverwrite: `${cid}-front` })
				: cardInfo.frontImg;

			const backImgUrl = backImg
				? await getImageUrl({ file: backImg, uid: cid, fileNameOverwrite: `${cid}-back` })
				: cardInfo.backImg;

			await getConnection().query(
				"UPDATE `cards` SET name=?, idol=?, img=?, title=?, idolJapanese=?, frontImg=?, backImg=?, event=? WHERE id=?",
				[
					name ?? cardInfo.name,
					idol ?? cardInfo.idol,
					imgUrl,
					title ?? cardInfo.title,
					idolJapanese ?? cardInfo.idolJapanese,
					frontImgUrl,
					backImgUrl,
					event ?? cardInfo.event,
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
			idolJapanese: t.Optional(t.String()),
			img: t.Optional(t.File()),
			frontImg: t.Optional(t.File()),
			backImg: t.Optional(t.File()),
			title: t.Optional(t.String()),
			event: t.Optional(t.String()),
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

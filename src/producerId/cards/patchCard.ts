import { Elysia, t } from "elysia";

import { getConnection } from "../../connection";
import { getImageUrl } from "../../posts/postPost";

const patchCard = new Elysia().patch(
	"/:cid",
	async ({ params: { cid }, body: { name, idol, img, title, idolJapanese, frontImg, backImg, event, config }, error }) => {
		try {
			const [cardInfo] = await getConnection().query(
				"SELECT name, idol, img, title, frontImg, backImg, event, config FROM cards WHERE id=?",
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
				"UPDATE `cards` SET name=?, idol=?, img=?, title=?, idolJapanese=?, frontImg=?, backImg=?, event=?, config=? WHERE id=?",
				[
					name ?? cardInfo.name,
					idol ?? cardInfo.idol,
					imgUrl,
					title ?? cardInfo.title,
					idolJapanese ?? cardInfo.idolJapanese,
					frontImgUrl,
					backImgUrl,
					event ?? cardInfo.event,
					config ? config : null,
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
			config: t.Optional(t.ObjectString({
				x: t.Optional(t.String()),
				y: t.Optional(t.String()),
				scale: t.Optional(t.String()),
			}))
		}),
		detail: {
			tags: ["Card"],
		},
	},
);

export default patchCard;

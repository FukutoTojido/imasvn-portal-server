import { Elysia, t } from "elysia";
import { getConnection } from "../connection";
import { privillage } from "../middleware";

const patchCharacter = new Elysia().use(privillage).patch(
	"/:id",
	async ({
		params: { id },
		error,
		body: {
			name,
			japaneseName,
			VA,
			japaneseVA,
			birthdate,
			birthmonth,
			imageColor,
			icon,
			age,
		},
	}) => {
		try {
			const [idol] = await getConnection().query(
				"SELECT * FROM idols WHERE id=?",
				[id],
			);
			if (!idol) {
				return error(404, "Not Found");
			}

			await getConnection().query(
				"UPDATE idols SET name=?, japaneseName=?, VA=?, japaneseVA=?, birthdate=?, birthmonth=?, imageColor=?, icon=?, age=? WHERE id=?",
				[
					name ?? idol?.name ?? null,
					japaneseName ?? idol?.japaneseName ?? null,
					VA ?? idol?.VA ?? null,
					japaneseVA ?? idol?.japaneseVA ?? null,
					birthdate ?? idol?.birthdate ?? null,
					birthmonth ?? idol?.birthmonth ?? null,
					imageColor ?? idol?.imageColor ?? null,
					icon ?? idol?.icon ?? null,
					age ?? idol?.age ?? null,
                    id
				],
			);

			return "Success";
		} catch (e) {
			console.error(e);
			return error(500, "Internal Server Error");
		}
	},
	{
		params: t.Object({
			id: t.String(),
		}),
		body: t.Object({
			name: t.Optional(t.String()),
			japaneseName: t.Optional(t.String()),
			VA: t.Optional(t.String()),
			japaneseVA: t.Optional(t.String()),
			birthdate: t.Optional(t.Number()),
			birthmonth: t.Optional(t.Number()),
			imageColor: t.Optional(t.String()),
			icon: t.Optional(t.String()),
			age: t.Optional(t.Number()),
		}),
	},
);

export default patchCharacter;

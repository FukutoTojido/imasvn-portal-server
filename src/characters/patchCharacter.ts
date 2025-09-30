import { Elysia, t } from "elysia";
import { getConnection } from "../connection";
import { privillage } from "../middleware";

const patchCharacter = new Elysia().use(privillage).patch(
	"/:id",
	async ({
		params: { id },
		status,
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
				return status(404, "Not Found");
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
		params: t.Object({
			id: t.String(),
		}),
		body: t.Object({
			name: t.Optional(t.Nullable(t.String())),
			japaneseName: t.Optional(t.Nullable(t.String())),
			VA: t.Optional(t.Nullable(t.String())),
			japaneseVA: t.Optional(t.Nullable(t.String())),
			birthdate: t.Optional(t.Nullable(t.Number())),
			birthmonth: t.Optional(t.Nullable(t.Number())),
			imageColor: t.Optional(t.Nullable(t.String())),
			icon: t.Optional(t.Nullable(t.String())),
			age: t.Optional(t.Nullable(t.Number())),
		}),
	},
);

export default patchCharacter;

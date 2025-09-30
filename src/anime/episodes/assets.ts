import { Elysia, file, t } from "elysia";

const assets = new Elysia().get(
	"/:episode/assets/:assets",
	async ({ params: { id, episode, assets } }) => {
		return file(`public/anime/${id}-${episode}/${assets}`);
	},
	{
		params: t.Object({
			id: t.Number(),
			episode: t.Number(),
			assets: t.String()
		}),
	},
);

export default assets;

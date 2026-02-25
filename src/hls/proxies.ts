import { Elysia, t } from "elysia";
import { getConnection } from "../connection";
import { token } from "../middleware";

const getAllProxies = new Elysia().use(token).get("/proxies", async ({ status }) => {
	try {
		const entries = await getConnection().query(
			"SELECT id, name, thumbnail FROM (hls_url)",
		);
		return entries;
	} catch (e) {
		console.error(e);
		return status(500, "Internal Server Error");
	}
});

const getProxies = new Elysia().use(token).get(
	"/proxies/:id",
	async ({ params: { id }, status }) => {
		try {
			const [entry] = await getConnection().query(
				`SELECT * FROM (hls_url) WHERE id=?`,
				[id],
			);

			if (!entry) {
				return status(404, "Not Found");
			}

			return entry;
		} catch (e) {
			console.error(e);
			return status(500, "Internal Server Error");
		}
	},
	{
		params: t.Object({
			id: t.String(),
		}),
	},
);

const getProxiesPreview = new Elysia().get(
	"/proxies/:id/preview",
	async ({ params: { id }, status }) => {
		try {
			const [entry] = await getConnection().query(
				`SELECT name, thumbnail FROM (hls_url) WHERE id=?`,
				[id],
			);

			if (!entry) {
				return status(404, "Not Found");
			}

			return entry;
		} catch (e) {
			console.error(e);
			return status(500, "Internal Server Error");
		}
	},
	{
		params: t.Object({
			id: t.String(),
		}),
	},
); 

const postProxies = new Elysia().post(
	"/proxies",
	async ({ body: { id, url, name, thumbnail }, status }) => {
		try {
			await getConnection().query(
				"INSERT INTO `hls_url` (id, m3u8, name, thumbnail) VALUES (?, ?, ?, ?)",
				[id, url, name, thumbnail],
			);
			return "Success";
		} catch (e) {
			console.error(e);
			return status(500, "Internal Server Error");
		}
	},
	{
		body: t.Object({
			id: t.String(),
			url: t.Optional(t.String()),
			name: t.Optional(t.String()),
			thumbnail: t.Optional(t.String()),
		}),
	},
);

const patchProxies = new Elysia().patch(
	"/proxies/:id",
	async ({ body: { url, name, thumbnail }, params: { id }, status }) => {
		try {
			await getConnection().query(
				"UPDATE `hls_url` SET m3u8=?, name=?, thumbnail=? WHERE id=?",
				[url, name, thumbnail, id],
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
			url: t.Optional(t.String()),
			name: t.Optional(t.String()),
			thumbnail: t.Optional(t.String()),
		}),
	},
);

const deleteProxies = new Elysia().delete(
	"/proxies/:id",
	async ({ params: { id }, status }) => {
		try {
			if (id === "root") {
				return status(403, "Forbidden");
			}

			await getConnection().query("DELETE FROM `hls_url` WHERE id=?", [id]);
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
	},
);

export { getAllProxies, getProxies, getProxiesPreview, postProxies, patchProxies, deleteProxies };

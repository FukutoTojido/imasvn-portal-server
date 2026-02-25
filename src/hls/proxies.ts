import { Elysia, t } from "elysia";
import { getConnection } from "../connection";

const getAllProxies = new Elysia().get("/proxies", async ({ status }) => {
	try {
		const entries = await getConnection().query("SELECT id FROM (hls_url)");
		return entries;
	} catch (e) {
		console.error(e);
		return status(500, "Internal Server Error");
	}
});

const getProxies = new Elysia().get(
	"/proxies/:id",
	async ({ params: { id }, status }) => {
		try {
			const [entry] = await getConnection().query(
				`SELECT * FROM (hls_url) WHERE id=?`,
				[id],
			);

			if (!entry?.m3u8) {
				return status(404, "Not Found");
			}

			return entry.m3u8;
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
	async ({ body: { id, url }, status }) => {
		try {
			await getConnection().query(
				"INSERT INTO `hls_url` (id, m3u8) VALUES (?, ?)",
				[id, url],
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
			url: t.String(),
		}),
	},
);

const patchProxies = new Elysia().patch(
	"/proxies/:id",
	async ({ body: { url }, params: { id }, status }) => {
		try {
			await getConnection().query("UPDATE `hls_url` SET m3u8=? WHERE id=?", [
				url,
				id,
			]);
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
			url: t.String(),
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

export { getAllProxies, getProxies, postProxies, patchProxies, deleteProxies };

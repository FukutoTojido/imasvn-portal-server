import Elysia, { t } from "elysia";
import { getConnection } from "../connection";

const forward = new Elysia().group("/forward", (app) =>
	app.get(
		"/:id/:resource",
		async ({ params: { id, resource }, status }) => {
			try {
				const [entry] = await getConnection().query(
					`SELECT * FROM (hls_url) WHERE id=?`,
					[id],
				);

				if (!entry) {
					return status(500, "Internal Server Error");
				}

				const customHeaders = Object.entries(
					JSON.parse(entry.headers || "{}"),
				).reduce<Record<string, string>>((accm, [key, value]) => {
					accm[key] = JSON.stringify(value);
					return accm;
				}, {});

				const response = await fetch(`${entry.forward_url}/${resource}`, {
					method: "GET",
					headers: {
						cookie: entry.cookies,
						...customHeaders,
					},
				});

				return status(response.status, response);
			} catch (e) {
				console.error(e);
				return status(500, "Error hehe");
			}
		},
		{
			params: t.Object({
				id: t.String(),
				resource: t.String(),
			}),
		},
	),
);

export default forward;

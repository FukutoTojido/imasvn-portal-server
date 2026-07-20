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

				const response = await fetch(`${entry.forward_url}/${resource}`, {
					method: "GET",
					headers: {
						cookie: entry.cookies,
					},
				});

				return status(200, response);
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

export default forward

import { Elysia, t } from "elysia";
import { token } from "../middleware";

const whep = new Elysia({ prefix: "/whep" })
	.options(
		"/",
		async ({ error, set, request }) => {
			if (!process.env.STREAM_ENDPOINT)
				return error(500, "Internal Server Error");

			try {
				const res = await fetch(process.env.STREAM_ENDPOINT, {
					method: "OPTIONS",
				});

				set.status = 204;
				const link = res.headers.get("Link")
					? { Link: res.headers.get("Link") as string }
					: undefined;
				set.headers = {
					...link,
					"Access-Control-Allow-Headers":
						"Authorization, Content-Type, If-Match",
					"Access-Control-Expose-Headers": "Link",
					"Access-Control-Allow-Origin": request.headers.get(
						"origin",
					) as string,
					"Access-Control-Allow-Methods": "OPTIONS",
					"Access-Control-Allow-Credentials": "true",
				};
			} catch (e) {
				console.error(e);
				return error(500, "Internal Server Error");
			}
		},
		{
			detail: {
				tags: ["Live"],
			},
		},
	)
	.use(token)
	.post(
		"/",
		async ({ body, error, set, request }) => {
			if (!process.env.STREAM_ENDPOINT)
				return error(500, "Internal Server Error");
			try {
				const res = await fetch(process.env.STREAM_ENDPOINT, {
					method: "POST",
					body: body as string,
					headers: {
						"Content-type": "application/sdp",
						credentials: "omit",
					},
				});

				switch (res.status) {
					case 201:
						break;
					case 404:
						return error(404, "Stream Not Found");
					case 400:
						return res.json().then((e) => {
							return error(400, e.error);
						});
					default:
						return error(res.status, `bad status code ${res.status}`);
				}

				set.headers = {
					location: res.headers.get("Location") as string,
					"Access-Control-Allow-Headers":
						"Authorization, Content-Type, If-Match",
					"Access-Control-Expose-Headers":
						"ETag, ID, Accept-Patch, Link, Location",
					"Access-Control-Allow-Origin": request.headers.get(
						"origin",
					) as string,
					"Access-Control-Allow-Credentials": "true",
				};

				set.status = 201;

				const data = await res.text();
				return data;
			} catch (e) {
				console.error(e);
				return error(500, "Internal Server Error");
			}
		},
		{
			body: t.String(),
			detail: {
				tags: ["Live"],
			},
		},
	);

export default whep;

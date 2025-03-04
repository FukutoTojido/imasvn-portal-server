import { Elysia, t } from "elysia";
import checkToken from "../middleware";

const whep = new Elysia({ prefix: "/whep" }).post(
	"/",
	async ({ body: { sdp }, cookie: { refresh_token }, error }) => {
		if (!process.env.STREAM_ENDPOINT)
			return error(500, "Internal Server Error");
		try {
			if (!(await checkToken(refresh_token.value)))
				return error(401, "Unauthorized");
			
			const res = await fetch(process.env.STREAM_ENDPOINT, {
				method: "POST",
				body: sdp,
				headers: {
					"Content-type": "application/sdp",
				},
			});

			const data = await res.text();
			return data;
		} catch (e) {
			return error(500, "Internal Server Error");
		}
	},
	{
		body: t.Object({
			uid: t.Optional(t.String()),
			sdp: t.String(),
		}),
		cookie: t.Object({
			refresh_token: t.Optional(t.String()),
		}),
		detail: {
			tags: ["Live"],
		},
	},
);

export default whep;

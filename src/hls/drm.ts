import { Elysia, t } from "elysia";
import { getConnection } from "../connection";

const DRM = new Elysia({
	detail: {
		tags: ["Live"],
	},
})
	.post(
		"/drm",
		async ({ body, status }) => {
			try {
				const [entry] = await getConnection().query(
					`SELECT mpd, cookies, cond FROM (ooi)`,
				);
				if (!entry) {
					return status(500, "Internal Server Error");
				}

				const licenseUrl = process.env.X_LICENSE ?? "";
				const response = await fetch(licenseUrl, {
					method: "POST",
					body: body as ArrayBuffer,
					headers: {
						cookie: entry.cookies,
						"X-Condition": entry.cond,
						Host: process.env.X_HOST ?? "",
						"User-Agent":
							"Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0",
						Accept: "*/*",
						"Accept-Language": "en-GB,en;q=0.9",
						"Content-type": "application/octet-stream",
						DNT: "1",
						"Sec-GPC": "1",
						Origin: process.env.X_ORIGIN ?? "",
						Referer: process.env.X_REFERRER ?? "",
						"Sec-Fetch-Mode": "cors",
						"Sec-Fetch-Site": "same-site",
						"Sec-Fetch_Dest": "empty",
						TE: "trailers",
						Connection: "keep-alive",
					},
				});

				if (!response.ok) {
					console.log(await response.json());
					throw new Error("Cannot request key");
				}

				const res = await response.arrayBuffer();
				return status(200, res);
			} catch (e) {
				console.error(e);
				return status(500, "Error hehe");
			}
		},
		{
			body: t.Optional(t.Any()),
		},
	)
	.get("/mpd", async ({ status }) => {
		try {
			const [entry] = await getConnection().query(`SELECT mpd FROM (ooi)`);

			if (!entry) {
				return status(404, "Not Found");
			}

			return entry;
		} catch (e) {
			console.error(e);
			return status(500, "Internal Server Error");
		}
	});

const DRMData = new Elysia({
	detail: {
		tags: ["Live"],
	},
})
	.get("/ooi", async ({ status }) => {
		try {
			const [entry] = await getConnection().query(
				`SELECT mpd, cookies, cond FROM (ooi)`,
			);

			if (!entry) {
				return status(404, "Not Found");
			}

			return entry;
		} catch (e) {
			console.error(e);
			return status(500, "Internal Server Error");
		}
	})
	.post(
		"/ooi",
		async ({ body: { mpd, cookies, cond }, status }) => {
			try {
				await getConnection().query(
					"UPDATE `ooi` SET mpd=?, cookies=?, cond=?",
					[mpd, cookies, cond],
				);
				return {
					cookies,
					cond,
				};
			} catch (e) {
				console.error(e);
				return status(500, "Internal Server Error");
			}
		},
		{
			body: t.Object({
				mpd: t.String(),
				cookies: t.String(),
				cond: t.String(),
			}),
		},
	);

export default DRM;
export { DRMData };

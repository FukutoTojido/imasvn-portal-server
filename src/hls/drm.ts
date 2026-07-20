import axios from "axios";
import { Elysia, t } from "elysia";
import { getConnection } from "../connection";

const DRM = new Elysia({
	detail: {
		tags: ["Live"],
	},
})
	.post(
		"/drm/:id",
		async ({ body, status, params: { id } }) => {
			try {
				const [entry] = await getConnection().query(
					`SELECT * FROM (hls_url) WHERE id=?`,
					[id],
				);
				if (!entry) {
					return status(500, "Internal Server Error");
				}

				// const customHeaders = Object.entries(JSON.parse(entry.headers)).reduce<
				// 	Record<string, string>
				// >((accm, [key, value]) => {
				// 	accm[key] = JSON.stringify(value);
				// 	return accm;
				// }, {});

				const licenseUrl = process.env.X_LICENSE ?? "";
				const response = await fetch(licenseUrl, {
					method: "POST",
					body: body as ArrayBuffer,
					headers: {
						// cookie: entry.cookies,
						// Host: process.env.X_HOST ?? "",
						// "User-Agent":
						// 	"Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0",
						// Accept: "*/*",
						// "Accept-Language": "en-GB,en;q=0.9",
						"content-type": "application/octet-stream",
						// DNT: "1",
						// "Sec-GPC": "1",
						// Origin: process.env.X_ORIGIN ?? "",
						// Referer: process.env.X_REFERRER ?? "",
						// "Sec-Fetch-Mode": "cors",
						// "Sec-Fetch-Site": "same-site",
						// "Sec-Fetch_Dest": "empty",
						// TE: "trailers",
						// Connection: "keep-alive",
						[process.env.X_S_LABEL as string]: process.env.X_S as string
						// ...customHeaders,
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
	.get("/token", async ({ status }) => {
		try {
			const { data: bearer } = await axios.get(
				`${process.env.TOKEN_URL}?t=${Date.now()}`,
			);
			return bearer;
		} catch (e) {
			console.error(e);
			return status(500, "Internal Server Error");
		}
	});

export default DRM;

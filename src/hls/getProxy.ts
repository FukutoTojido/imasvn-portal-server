import { Elysia, t } from "elysia";
import { getConnection } from "../connection";

const getProxy = new Elysia().get(
	"/proxy",
	async ({ query: { passphrase }, status }) => {
		if (passphrase !== process.env.M3U8_PASS) {
			return status(403, "Forbidden");
		}

		const [entry] = await getConnection().query(
			`SELECT * FROM (hls_url)`,
		);

        if (!entry?.m3u8) {
            return status(404, "Not Found");
        }

        return entry.m3u8;
	},
	{
		query: t.Object({
			passphrase: t.String(),
		}),
	},
);

export default getProxy;

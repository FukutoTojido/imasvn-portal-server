import { Elysia, t } from "elysia";
import { getConnection } from "../connection";

const getProxy = new Elysia().get(
	"/proxy",
	async ({ params: { passphrase }, status }) => {
		if (passphrase !== process.env.M3U8_PASS) {
			return status(403, "Forbidden");
		}

		const [m3u8] = await getConnection().query(
			`SELECT * FROM (hls_url)`,
		);

        if (!m3u8) {
            return status(404, "Not Found");
        }

        return m3u8;
	},
	{
		params: t.Object({
			passphrase: t.String(),
		}),
	},
);

export default getProxy;

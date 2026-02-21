import axios from 'axios'
import { Elysia } from "elysia";
import { token } from "../middleware";

const getM3U8 = new Elysia().use(token).get(
	"/m3u8",
	async ({ status }) => {
        try {
            const { data } = await axios.get(process.env.HLS_HOST as string);
            return data;
        } catch (e) {
            console.error(e);
            return status(500, "Internal Server Error");
        }
	},
);

export default getM3U8;

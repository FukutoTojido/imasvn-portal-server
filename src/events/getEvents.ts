import { Elysia } from "elysia";
import { getConnection } from "../connection";

const getEvents = new Elysia().get(
	"/",
	async ({ error }) => {
		try {
			const events = await getConnection().query(`SELECT * FROM events ORDER BY startDate DESC`);
			return events;
		} catch (e) {
			console.error(e);
			return error(500, "Internal Server Error");
		}
	},
	{
		detail: {
			tags: ["Events"],
		},
	},
);

export default getEvents;

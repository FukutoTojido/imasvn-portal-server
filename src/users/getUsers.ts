import { Elysia } from "elysia";
import { getConnection } from "../connection";

const getUsers = new Elysia().get(
	"/",
	async ({ error }) => {
		try {
			const users = await getConnection().query(
				"SELECT id, avatar, username, role FROM users",
			);
			return users;
		} catch (e) {
			console.error(e);
			return error(500, "Internal Server Error");
		}
	},
	{
		detail: {
			tags: ["Users"],
		},
	},
);

export default getUsers;

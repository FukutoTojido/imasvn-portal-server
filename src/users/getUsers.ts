import { Elysia } from "elysia";
import { getConnection } from "../connection";

const getUsers = new Elysia().get(
	"/",
	async ({ status }) => {
		try {
			const users = await getConnection().query(
				"SELECT id, avatar, username, tag, role, pid FROM users ORDER BY username ASC",
			);
			return users;
		} catch (e) {
			console.error(e);
			return status(500, "Internal Server Error");
		}
	},
	{
		detail: {
			tags: ["Users"],
		},
	},
);

export default getUsers;

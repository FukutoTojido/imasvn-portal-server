import { Elysia, t } from "elysia";
import { getConnection } from "../connection";

export const getDiscordInfo = async (id: string) => {
	const [userData] = await getConnection().query(
		"SELECT * FROM `users` WHERE id=?",
		[id],
	);

	if (!userData) return null;
	return {
		id: userData.id,
		name: userData.username,
		tag: userData.tag,
		avatar: userData.avatar,
		banner: userData.banner,
		isJoinedServer: userData.joined,
		pid: userData.pid
	};
}

const getUser = new Elysia().get(
	"/:id",
	async ({ params: { id }, status }) => {
		try {
			const userData = await getDiscordInfo(id);
			if (!userData) return status(404, "User Not Found");
			
			return userData;
		} catch (e) {
			console.error(e);
			return status(500, "Internal Server Error");
		}
	},
	{
		params: t.Object({
			id: t.String(),
		}),
		detail: {
			tags: ["Users"]
		}
	},
);

export default getUser;

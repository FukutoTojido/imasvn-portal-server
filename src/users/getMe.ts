import { Elysia, t } from "elysia";
import md5 from "md5";
import { getConnection } from "../connection";

export const getMeInfo = async (token?: string) => {
	if (!token) return null;

	const [userData] = await getConnection().query(
		"SELECT * FROM `users` INNER JOIN `hash_token` ON users.id=hash_token.uid WHERE hash=?",
		[md5(token)],
	);

	if (!userData) return null;
	return {
		id: userData.id,
		name: userData.username,
		tag: userData.tag,
		avatar: userData.avatar,
		banner: userData.banner,
		isJoinedServer: userData.joined,
	};
};

const getMe = new Elysia().get(
	"/@me",
	async ({ cookie, error }) => {
		try {
			const userData = await getMeInfo(cookie.access_token.value);
			if (!userData) return error(404, "User Not Found");

			return userData;
		} catch (e) {
			console.error(e);
			error(500, "Internal Server Error");
		}
	},
	{
		cookie: t.Object({
			access_token: t.Optional(t.String()),
		}),
		detail: {
			tags: ["Users"],
		},
	},
);

export default getMe;

import { Elysia, t } from "elysia";
import { getConnection } from "../connection";
import { jwtAccess } from "./setup";

const authMe = new Elysia().use(jwtAccess).get(
	"/@me",
	async ({ cookie: { access_token, refresh_token }, status, jwtAccess }) => {
		try {
			if (!access_token.value) {
				return status(401, "Unauthorized");
			}

			const payload = await jwtAccess.verify(access_token.value);
			if (!payload) {
				return status(403, "Forbidden");
			}

			const { id } = payload;

			const [entry] = await getConnection().query(
				"SELECT hash FROM hash_token WHERE uid=?",
				[id],
			);
			if (
				!entry ||
				!refresh_token.value ||
				!(await Bun.password.verify(refresh_token.value, entry.hash))
			) {
				return status(401, "Unauthorized");
			}

			const [user] = await getConnection().query(
				"SELECT id, username, tag, avatar, banner, joined, role FROM `users` WHERE id=?",
				[id],
			);
			if (!user) return status(403, "Forbidden");

			const discordInfo = {
				id: user.id,
				name: user.username,
				tag: user.tag,
				avatar: user.avatar,
				banner: user.banner,
				isJoinedServer: user.joined,
				role: user.role,
			};

			return discordInfo;
		} catch (e) {
			console.error(e);
			return status(500, "Internal Server Error");
		}
	},
	{
		cookie: t.Object({
			access_token: t.Optional(t.String()),
			refresh_token: t.Optional(t.String()),
		}),
		detail: {
			tags: ["Auth"],
		},
	},
);

export default authMe;

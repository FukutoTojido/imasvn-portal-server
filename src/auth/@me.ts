import { Elysia, t } from "elysia";
import { refresh, updateDiscordInfo } from "./getAuth";
import { getMeInfo } from "../users/getMe";
import md5 from "md5";
import { getConnection } from "../connection";

const authMe = new Elysia().get(
	"/@me",
	async ({ cookie, error }) => {
		try {
			if (!cookie.refresh_token.value) return error(401, "Unauthorized");

			const [user] = await getConnection().query(
				"SELECT `uid` FROM `hash_token` WHERE hash=?",
				[md5(cookie.refresh_token.value)],
			);
			if (!user) return error(500, "User not found");

			const tokens = await refresh(cookie.refresh_token.value);
			if (!tokens) return error(500, "Cannot refresh token");

			await getConnection().query(
				"UPDATE `hash_token` SET hash=? WHERE uid=?",
				[md5(tokens.refresh_token), user.uid],
			);

			const discordInfo = await getMeInfo(tokens.refresh_token);
			if (!discordInfo) return error(500, "Cannot get user info");

			return {
				...discordInfo,
				tokens: {
					access_token: tokens.access_token,
					refresh_token: tokens.refresh_token,
					atExpire: new Date(Date.now() + tokens.expires_in * 1000).getTime(),
					rtExpire: new Date(Date.now() + 399 * 24 * 60 * 60 * 1000).getTime(),
				},
			};
		} catch (e) {
			console.error(e);
			return error(500, "Internal Server Error");
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

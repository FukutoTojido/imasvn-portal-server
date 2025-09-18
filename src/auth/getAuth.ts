import DiscordOauth2, { type DiscordRESTError } from "discord-oauth2";
import { Elysia, t } from "elysia";
import { getConnection } from "../connection";
import { jwtAccess, jwtRefresh } from "./setup";

const urlFactory = (
	{
		id,
		server,
		global,
	}: {
		id: string;
		server?: string;
		global?: string;
	},
	type: "avatars" | "banners",
) => {
	if (server)
		return `https://cdn.discordapp.com/guilds/228205151981273088/users/${id}/${type}/${server}`;
	if (global) return `https://cdn.discordapp.com/${type}/${id}/${global}`;
	return "";
};

async function getMe(access_token: string) {
	try {
		const res = await fetch("https://discord.com/api/users/@me", {
			headers: {
				Authorization: `Bearer ${access_token}`,
			},
		});

		const json = await res.json();
		if (!res.ok) {
			throw json;
		}

		return json;
	} catch (e) {
		console.error(e);
		return null;
	}
}

async function getMember(access_token: string) {
	try {
		const res = await fetch(
			"https://discord.com/api/users/@me/guilds/228205151981273088/member",
			{
				headers: {
					Authorization: `Bearer ${access_token}`,
				},
			},
		);

		const json = await res.json();
		if (!res.ok) {
			throw json;
		}

		return json;
	} catch (e) {
		console.error(e);
		return null;
	}
}

async function getDiscordInfo(access_token: string) {
	try {
		const me = await getMe(access_token);
		const guild = await getMember(access_token);
		if (!me) return null;

		return { me, guild };
	} catch (error) {
		console.error(error);
		return null;
	}
}

export async function updateDiscordInfo(access_token: string) {
	try {
		const discordInfo = await getDiscordInfo(access_token);
		if (!discordInfo) return null;

		const { me, guild } = discordInfo;

		const username = guild?.nick ?? me?.global_name ?? me?.username;

		const avatar = urlFactory(
			{
				id: me.id,
				server: guild?.avatar,
				global: me.avatar,
			},
			"avatars",
		);

		const banner = urlFactory(
			{
				id: me.id,
				server: guild?.banner,
				global: me.banner,
			},
			"banners",
		);

		await getConnection().query(
			"INSERT INTO `users` (id, username, avatar, banner, tag, joined) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE username=?, avatar=?, banner=?, tag=?, joined=?",
			[
				me.id,
				username,
				avatar,
				banner,
				me.username,
				guild !== null,
				username,
				avatar,
				banner,
				me.username,
				guild !== null,
			],
		);

		return {
			id: me.id,
			name: username,
			avatar,
			banner,
			username: me.username,
			joined: guild !== null,
		};
	} catch (error) {
		console.error(error);
		return null;
	}
}

async function grantToken(code: string) {
	const oauth = new DiscordOauth2();

	try {
		const tokens = await oauth.tokenRequest({
			clientId: process.env.DISCORD_CLIENT_ID,
			clientSecret: process.env.DISCORD_CLIENT_SECRET,
			redirectUri: process.env.REDIRECT_URL,
			scope: "identify guilds guilds.members.read",
			grantType: "authorization_code",
			code,
		});

		return tokens;
	} catch (e) {
		console.error((e as DiscordRESTError).response);
		return null;
	}
}

const getAuth = new Elysia()
	.use(jwtAccess)
	.use(jwtRefresh)
	.get(
		"/",
		async ({
			query: { code },
			error,
			redirect,
			jwtAccess,
			jwtRefresh,
			cookie,
		}) => {
			try {
				if (!code) {
					return error(401, null);
				}

				const tokens = await grantToken(code);

				if (tokens === null) return redirect(process.env.LOGIN_URL ?? "");
				const access_token = tokens.access_token;

				const discordInfo = await updateDiscordInfo(access_token);
				if (!discordInfo) throw "Cannot update Discord info";

				const at = await jwtAccess.sign({ id: discordInfo.id });
				const rt = await jwtRefresh.sign({ id: discordInfo.id });
				const hashed = await Bun.password.hash(rt);

				await getConnection().query(
					"INSERT INTO `hash_token` (uid, hash) VALUES (?, ?) ON DUPLICATE KEY UPDATE hash=?",
					[discordInfo.id, hashed, hashed],
				);

				const atExpire = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
				const rtExpire = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

				cookie.access_token.set({
					value: at,
					sameSite: "lax",
					httpOnly: true,
					secure: true,
					expires: atExpire,
				});

				cookie.refresh_token.set({
					value: rt,
					sameSite: "lax",
					secure: true,
					httpOnly: true,
					expires: rtExpire,
				});

				return redirect(`${import.meta.env.WEB_URL}`);
			} catch (e) {
				console.error(e);
				return error(500, "Internal Server Error");
			}
		},
		{
			query: t.Object({
				code: t.Optional(t.String()),
			}),
			detail: {
				tags: ["Auth"],
			},
			cookie: t.Object({
				access_token: t.Optional(t.String()),
				refresh_token: t.Optional(t.String()),
			}),
		},
	);

export default getAuth;

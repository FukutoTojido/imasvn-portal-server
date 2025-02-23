import { Elysia, t } from "elysia";
import DiscordOauth2, { type DiscordRESTError } from "discord-oauth2";
import { getConnection } from "../connection";
import md5 from "md5";

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

export async function updateDiscordInfo(access_token: string, refresh_token: string) {
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

		const [user] = await getConnection().query(
			"SELECT * FROM `users` WHERE id=?",
			[me.id],
		);

		if (!user) {
			await getConnection().query(
				"INSERT INTO `users` (id, username, avatar, banner, tag, joined) VALUES (?, ?, ?, ?, ?, ?)",
				[me.id, username, avatar, banner, me.username, guild !== null],
			);
			await getConnection().query(
				"INSERT INTO `hash_token` (uid, hash) VALUES (?, ?)",
				[me.id, md5(refresh_token)],
			);
		} else {
			await getConnection().query(
				"UPDATE `users` SET username=?, avatar=?, banner=?, tag=?, joined=? WHERE id=?",
				[username, avatar, banner, me.username, guild !== null, me.id],
			);
			await getConnection().query(
				"UPDATE `hash_token` SET hash=? WHERE uid=?",
				[md5(refresh_token), me.id],
			);
		}

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

export async function refresh(refresh_token: string) {
	const oauth = new DiscordOauth2();
	// console.log(refresh_token);

	try {
		const tokens = await oauth.tokenRequest({
			clientId: process.env.DISCORD_CLIENT_ID,
			clientSecret: process.env.DISCORD_CLIENT_SECRET,
			redirectUri: process.env.REDIRECT_URL,
			scope: "identify guilds guilds.members.read",
			grantType: "refresh_token",
			refreshToken: refresh_token,
		});

        // console.log(tokens);

		return tokens;
	} catch (e) {
		console.error((e as DiscordRESTError).response);
		return null;
	}
}

const getAuth = new Elysia().get(
	"/",
	async ({ query: { code }, error, redirect, cookie }) => {
		try {
			let access_token = cookie.access_token.value;
			let refresh_token = cookie.refresh_token.value;

			if (!refresh_token && !code) {
				return error(401, null);
			}

			const tokens = code
				? await grantToken(code)
				: refresh_token
					? await refresh(refresh_token)
					: null;

			if (tokens === null) return redirect(process.env.LOGIN_URL ?? "");
			access_token = tokens.access_token;
			refresh_token = tokens.refresh_token;

			const discordInfo = await updateDiscordInfo(access_token, refresh_token);
			if (!discordInfo) throw "Cannot update Discord info";

			const atExpire = new Date(Date.now() + tokens.expires_in * 1000);
			const rtExpire = new Date(Date.now() + 399 * 24 * 60 * 60 * 1000);

			cookie.access_token.set({
				value: tokens.access_token,
				sameSite: "strict",
				secure: true,
				expires: atExpire,
			});

			cookie.refresh_token.set({
				value: tokens.refresh_token,
				sameSite: "strict",
				secure: true,
				expires: rtExpire,
			});

			return redirect(
				`http://localhost:3000/auth?at=${tokens.access_token}&rt=${tokens.refresh_token}&atExpire=${atExpire.getTime()}&rtExpire=${rtExpire.getTime()}`,
			);
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

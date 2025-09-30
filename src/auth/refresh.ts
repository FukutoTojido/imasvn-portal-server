import { Elysia, t } from "elysia";
import { getConnection } from "../connection";
import { jwtAccess, jwtRefresh } from "./setup";

const refresh = new Elysia()
	.use(jwtAccess)
	.use(jwtRefresh)
	.post(
		"/refresh",
		async ({
			cookie: { access_token, refresh_token },
			status,
			jwtRefresh,
			jwtAccess,
		}) => {
			if (!refresh_token.value) {
				return status(401, "Unauthorized");
			}

			if (access_token) {
				const payload = await jwtAccess.verify(access_token.value);
				if (payload) {
					const diff = (payload.exp ?? 0) * 1000 - Date.now();
					if (diff > 60 * 1000) return "Success";
				}
			}

			const payload = await jwtRefresh.verify(refresh_token.value);
			if (!payload) {
				return status(403, "Forbidden");
			}

			const id = payload.id;
			const [user] = await getConnection().query(
				"SELECT id FROM users WHERE id=?",
				[id],
			);

			if (!user) {
				return status(403, "Forbidden");
			}

			const at = await jwtAccess.sign({ id: user.id });
			const rt = await jwtRefresh.sign({ id: user.id });
			const hashed = await Bun.password.hash(rt);

			await getConnection().query(
				"INSERT INTO `hash_token` (uid, hash) VALUES (?, ?) ON DUPLICATE KEY UPDATE hash=?",
				[user.id, hashed, hashed],
			);

			const atExpire = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
			const rtExpire = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

			access_token.set({
				value: at,
				sameSite: "lax",
				httpOnly: true,
				secure: true,
				expires: atExpire,
			});

			refresh_token.set({
				value: rt,
				sameSite: "lax",
				secure: true,
				httpOnly: true,
				expires: rtExpire,
			});
		},
		{
			cookie: t.Object({
				access_token: t.Optional(t.String()),
				refresh_token: t.Optional(t.String()),
			}),
		},
	);

export default refresh;

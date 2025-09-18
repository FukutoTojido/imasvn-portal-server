import { Elysia } from "elysia";
import { jwtAccess } from "./auth/setup";
import { getConnection } from "./connection";
import { ROLE } from "./types";

export const token = new Elysia()
	.use(jwtAccess)
	.derive({ as: "scoped" }, async ({ jwtAccess, cookie: { access_token } }) => {
		if (!access_token.value) {
			throw new Error("Unauthorized");
		}

		const payload = await jwtAccess.verify(access_token.value);
		if (!payload) {
			throw new Error("Forbidden");
		}

		const [userData] = await getConnection().query(
			"SELECT (role) FROM users WHERE id=?",
			[payload.id],
		);

		if (!userData.joined) {
			throw new Error("Forbidden");
		}

		return userData;
	});

export const privillage = new Elysia()
	.use(jwtAccess)
	.derive({ as: "scoped" }, async ({ jwtAccess, cookie: { access_token } }) => {
		if (!access_token.value) {
			throw new Error("Unauthorized");
		}

		const payload = await jwtAccess.verify(access_token.value);
		if (!payload) {
			throw new Error("Forbidden");
		}

		const [userData] = await getConnection().query(
			"SELECT (role) FROM users WHERE id=?",
			[payload.id],
		);

		if (userData.role !== ROLE.ADMIN) {
			throw new Error("Forbidden");
		}

		return userData;
	});

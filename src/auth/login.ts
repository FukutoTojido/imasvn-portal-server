import { Elysia } from "elysia";

const login = new Elysia().get(
	"/login",
	({ redirect, error }) => {
		if (!process.env.OAUTH_URL) return error(500, "Internal Server Error");
		return redirect(process.env.OAUTH_URL);
	},
	{
		detail: {
			tags: ["Auth"],
		},
	},
);

export default login;

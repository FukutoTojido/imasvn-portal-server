import { Elysia } from "elysia";

const login = new Elysia().get(
	"/login",
	({ redirect, status }) => {
		if (!process.env.OAUTH_URL) return status(500, "Internal Server Error");
		return redirect(process.env.OAUTH_URL);
	},
	{
		detail: {
			tags: ["Authentication"],
		},
	},
);

export default login;

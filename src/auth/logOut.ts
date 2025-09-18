import { Elysia, t } from "elysia";

const logOut = new Elysia().post(
	"/logOut",
	({ cookie: { access_token, refresh_token } }) => {
		access_token.remove();
		refresh_token.remove();
	},
	{
		cookie: t.Object({
			access_token: t.Optional(t.String()),
			refresh_token: t.Optional(t.String()),
		}),
	},
);

export default logOut;

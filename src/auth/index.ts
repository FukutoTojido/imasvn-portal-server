import { Elysia } from "elysia";
import authMe from "./@me";
import getAuth from "./getAuth";
import login from "./login";
import logOut from "./logOut";
import refresh from "./refresh";

const auth = new Elysia({
	prefix: "/auth",
	detail: { tags: ["Authentication"] },
})
	.use(getAuth)
	.use(refresh)
	.use(login)
	.use(logOut)
	.use(authMe);

export default auth;

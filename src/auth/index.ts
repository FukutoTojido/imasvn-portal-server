import { Elysia } from "elysia";
import login from "./login";
import authMe from "./@me";
import getAuth from "./getAuth";
import refresh from "./refresh";
import logOut from "./logOut";

const auth = new Elysia({ prefix: "/auth" })
	.use(getAuth)
	.use(refresh)
	.use(login)
	.use(logOut)
	.use(authMe);

export default auth;

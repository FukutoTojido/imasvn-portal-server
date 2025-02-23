import { Elysia } from "elysia";
import login from "./login";
import authMe from "./@me";
import getAuth from "./getAuth";

const auth = new Elysia({ prefix: "/auth" })
	.use(getAuth)
	.use(login)
	.use(authMe);

export default auth;

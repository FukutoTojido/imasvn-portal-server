import { Elysia, t } from "elysia";
import getUser from "./getUser";
import getAvatar from "./getAvatar";
import getUserPosts from "./getUserPosts";
import checkToken from "../middleware";
import getMe from "./getMe";

const users = new Elysia({ prefix: "users" })
	.use(getUser)
	.use(getMe)
	.use(getAvatar)
	.use(getUserPosts);

export default users;

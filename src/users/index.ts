import { Elysia } from "elysia";
import getAvatar from "./getAvatar";
import getMe from "./getMe";
import getUser from "./getUser";
import getUserPosts from "./getUserPosts";
import getUsers from "./getUsers";
import patchUserRole from "./patchUserRole";
import patchUserPID from "./patchUserPID";

const users = new Elysia().group("/users", (app) =>
	app
		.use(getUsers)
		.use(getUser)
		.use(getMe)
		.use(getAvatar)
		.use(getUserPosts)
		.use(patchUserRole)
		.use(patchUserPID),
);

export default users;

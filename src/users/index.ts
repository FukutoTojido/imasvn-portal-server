import { Elysia } from "elysia";
import { privillage } from "../middleware";
import getAvatar from "./getAvatar";
import getUser from "./getUser";
import getUserPosts from "./getUserPosts";
import getUsers from "./getUsers";
import patchUserPID from "./patchUserPID";
import patchUserRole from "./patchUserRole";

const users = new Elysia().group("/users", (app) =>
	app
		.use(getUsers)
		.use(getUser)
		.use(getAvatar)
		.use(getUserPosts)
		.group("", (app) =>
			app.use(privillage).use(patchUserRole).use(patchUserPID),
		),
);

export default users;

import { Elysia } from "elysia";
import getAvatar from "./getAvatar";
import getMe from "./getMe";
import getUser from "./getUser";
import getUserPosts from "./getUserPosts";

const users = new Elysia().group("/users", (app) =>
	app.use(getUser).use(getMe).use(getAvatar).use(getUserPosts),
);

export default users;

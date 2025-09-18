import { Elysia } from "elysia";
import comments from "./comments";
import postComment from "./comments/postComment";
import deletePost from "./deletePost";
import getPost from "./getPost";
import getPosts from "./getPosts";
import postPost from "./postPost";

const posts = new Elysia().group("/posts", (app) =>
	app
		.use(getPosts)
		.use(getPost)
		.use(deletePost)
		.use(postPost)
		.use(postComment)
		.use(comments),
);

export default posts;

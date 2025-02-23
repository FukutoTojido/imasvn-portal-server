import { Elysia, t } from "elysia";
import getPosts from "./getPosts";
import postPost from "./postPost";
import getPost from "./getPost";
import deletePost from "./deletePost";
import comments from "./comments";
import postComment from "./comments/postComment";

const posts = new Elysia().group("/posts", (app) =>
	app.use(getPosts).use(getPost).use(postPost).use(deletePost).use(comments).use(postComment),
);

export default posts;

import { Elysia } from "elysia";
import deleteComment from "./deleteComment";
import getComments from "./getComments";

const comments = new Elysia().group("/:id/comments", (app) =>
	app.use(getComments).use(deleteComment),
);

export default comments;

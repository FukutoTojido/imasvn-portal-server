import { Elysia, t } from "elysia";
import getComments from "./getComments";
import postComment from "./postComment";
import deleteComment from "./deleteComment";

const comments = new Elysia().group("/:id/comments", (app) =>
	app.use(getComments).use(deleteComment),
);

export default comments;

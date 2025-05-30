import { Elysia, t } from "elysia";
import { getConnection } from "../connection";

const getAvatar = new Elysia().get(
	"/:id/avatar",
	async ({ params: { id }, error, set, redirect }) => {
		try {
			const [userData] = await getConnection().query(
				"SELECT (avatar) FROM `users` WHERE id=?",
				[id],
			);
			if (!userData) return error(404, "User Not Found");

			// const res = await fetch(userData.avatar);
			// const contentType = res.headers.get("content-type");
			// if (res.body === null || contentType === null)
			// 	return error(500, "Internal Server Error");

			// set.headers["Content-Type"] = contentType;
			// return res.blob();
			return redirect(userData.avatar);
		} catch (e) {
			console.error(e);
			return error(500, "Internal Server Error");
		}
	},
	{
		params: t.Object({
			id: t.String(),
		}),
		detail: {
			tags: ["Users"]
		}
	},
);

export default getAvatar;

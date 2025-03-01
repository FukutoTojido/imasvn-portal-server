import { Elysia, t } from "elysia";
import { getConnection } from "../connection";
import getPreview from "./getPreview";
import setPreview from "./setPreview";

const preview = new Elysia().group("/live", (app) =>
	app.use(getPreview).use(setPreview),
);

export default preview;

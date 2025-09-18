import { Elysia, } from "elysia";
import { privillage } from "../middleware";
import getPreview from "./getPreview";
import setPreview from "./setPreview";

const preview = new Elysia().group("/live", (app) =>
	app.use(getPreview).use(privillage).use(setPreview),
);

export default preview;

import { Elysia, t } from "elysia";
import { getConnection } from "../../connection";
import { processQueue } from "./utils";

const patchEpisode = new Elysia({
    serve: {
        maxRequestBodySize: 1024 * 1024 * 300,
    },
})
    .use(processQueue)
    .patch(
        "/:episode",
        async ({
            params: { id, episode },
            body: { title, index, url },
            status,
        }) => {
            try {
                const entry = await getConnection().query(
                    `SELECT * FROM anime_episodes WHERE id=? AND animeId=?`,
                    [episode, id],
                );
                if (!entry) return status(404, "Not Found");

                await getConnection().query(
                    `UPDATE anime_episodes SET title=?, idx=?, url=? WHERE id=?`,
                    [title ?? entry.title, index ?? entry.idx, url || entry.url, episode],
                );

                return "Success";
            } catch (e) {
                console.error(e);
                return status(500, "Internal Server Error");
            }
        },
        {
            params: t.Object({
                id: t.Number(),
                episode: t.Number(),
            }),
            body: t.Object({
                title: t.Optional(t.String()),
                index: t.Optional(t.String()),
                url: t.Optional(t.String()),
            }),
        },
    );

export default patchEpisode;

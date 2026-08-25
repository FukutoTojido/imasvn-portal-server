import { Elysia, t } from "elysia";
import { getConnection } from "../../connection";

const postEpisode = new Elysia().post(
    "/",
    async ({
        params: { id },
        body: { title, index },
        status,
    }) => {
        try {
            const episode = await getConnection().query(
                `INSERT INTO anime_episodes (animeId, title, idx, state) VALUES (?, ?, ?, ?)`,
                [id, title, index, 0],
            );

            const episodeId = Number(episode.insertId);
            return episodeId;
        } catch (e) {
            console.error(e);
            return status(500, "Internal Server Error");
        }
    },
    {
        params: t.Object({
            id: t.Number(),
        }),
        body: t.Object({
            title: t.String(),
            index: t.String(),
        }),
    },
);

export default postEpisode;

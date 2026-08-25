import cors from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import { Elysia, file, t } from "elysia";
import anime from "./anime";
import episodes from "./anime/episodes";
import auth from "./auth";
import characters from "./characters";
import emojis from "./emojis";
import events from "./events";
import hls from "./hls";
import { b0131 } from "./lib/r2";
import live from "./live";
import posts from "./posts";
import preview from "./preview";
import producerId from "./producerId";
import users from "./users";
import whep from "./whep";
import ws from "./ws";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { privillage } from "./middleware";

const app = new Elysia({
    websocket: {
        idleTimeout: 120,
    },
    serve: {
        maxRequestBodySize: 1024 * 1024 * 2048,
    },
})
    .use(
        swagger({
            documentation: {
                tags: [
                    { name: "Authentication" },
                    { name: "Users" },
                    { name: "Posts" },
                    { name: "Characters" },
                    { name: "Emojis" },
                    { name: "Live" },
                ],
            },
        }),
    )
    .use(cors())
    .group("/api", (app) =>
        app
            .get("/", () => "Welcome to Ave Mujica.")
            .use(auth)
            .use(users)
            .use(posts)
            .use(preview)
            .use(characters)
            .use(emojis)
            .use(ws)
            .use(producerId)
            .use(events)
            .use(anime)
            .use(episodes)
            .use(whep)
            .use(hls)
            .use(live)
            .get(
                "/loop/:assets",
                ({ params: { assets } }) => file(`public/loop/${assets}`),
                {
                    params: t.Object({ assets: t.String() }),
                    detail: { tags: ["Assets"] },
                },
            )
            .group("", app =>
                app.use(privillage)
                    .post(
                        "/presigned",
                        async ({ body: { keys }, status }) => {
                            try {
                                const pair = await Promise.all(
                                    keys.map(async (key) => {
                                        const signedUrl = await getSignedUrl(
                                            b0131,
                                            new PutObjectCommand({
                                                Bucket: process.env.B0131_BUCKET_NAME,
                                                Key: key,
                                            }),
                                        );

                                        return [key, signedUrl];
                                    }),
                                );

                                return pair;
                            } catch (e) {
                                console.error(e);
                                return status(500, "Internal Server Error");
                            }
                        },
                        {
                            body: t.Object({
                                keys: t.Array(t.String()),
                            }),
                        },
                    )
            )
        // .post(
        // 	"/ztest/",
        // 	async ({ body: { file }, status }) => {
        // 		try {
        // 			const upload = new Upload({
        // 				client: b0131,
        // 				params: {
        // 					Bucket: process.env.B0131_BUCKET_NAME,
        // 					Key: file.name,
        // 					Body: file.stream(),
        // 					ContentType: "image/png",
        // 				},
        // 				queueSize: 4,
        // 				partSize: 10 * 1024 * 1024, // 10 MB per part
        // 				leavePartsOnError: false,
        // 			});

        // 			upload.on("httpUploadProgress", (progress) => {
        // 				const percentage =
        // 					progress.loaded && progress.total
        // 						? ((progress.loaded / progress.total) * 100).toFixed(1)
        // 						: "unknown";
        // 				console.log(
        // 					`Progress: ${percentage}% (${progress.loaded} / ${progress.total})`,
        // 				);
        // 			});

        // 			const result = await upload.done();
        // 			return `https://cdn-imasvn.nyancat0131.moe/${result.Key}`;
        // 		} catch (e) {
        // 			console.error(e);
        // 			return status(500, "Internal Server Error");
        // 		}
        // 	},
        // 	{
        // 		body: t.Object({ file: t.File() }),
        // 	},
        // ),
    )
    .listen(3001);

console.log(
    `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);

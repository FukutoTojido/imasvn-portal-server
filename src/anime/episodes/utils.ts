import { existsSync, mkdirSync, rmSync } from "node:fs";
import Elysia from "elysia";

export type SignalPair = {
	controller: AbortController,
	promise: Promise<unknown>
}

export const processQueue = new Elysia().decorate(
	"processQueue",
	new Map<string, SignalPair>(),
);

export const saveVideo = async (
	file: Blob,
	folderName: string,
	controller: AbortController,
	onFinish?: () => void
) => {
	try {
		const cwd = process.cwd();
		rmSync(`${cwd}/public/anime/${folderName}/`, {
			recursive: true,
			force: true,
		});
		if (!existsSync(`${cwd}/public/anime/${folderName}`)) {
			mkdirSync(`${cwd}/public/anime/${folderName}`);
		}

		await Bun.write(`${cwd}/public/anime/${folderName}/video`, file);

		const subprocess = Bun.spawnSync(
			[
				`${process.env.FFMPEG_PATH}ffmpeg`,
				"-i",
				`${cwd}/public/anime/${folderName}/video`,
				"-c:v",
				"copy",
				"-c:a",
				"copy",
				"-f",
				"hls",
				"-hls_list_size",
				"0",
				"-hls_time",
				"4",
				`${cwd}/public/anime/${folderName}/video.m3u8`,
			],
			{
				signal: controller.signal,
			},
		);

		onFinish?.();

		if (subprocess.signalCode === "SIGTERM") return;
		rmSync(`${cwd}/public/anime/${folderName}/video`);
	} catch (e) {
		console.error(e);
	}
};

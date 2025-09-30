import { existsSync, mkdirSync, rmSync } from "node:fs";
import { rm } from "node:fs/promises";

export const saveVideo = async (file: Blob, folderName: string) => {
	const cwd = process.cwd();
	rmSync(`${cwd}/public/anime/${folderName}/`, { recursive: true, force: true });
	if (!existsSync(`${cwd}/public/anime/${folderName}`)) {
		mkdirSync(`${cwd}/public/anime/${folderName}`);
	}

	await Bun.write(`${cwd}/public/anime/${folderName}/video`, file);

	Bun.spawnSync([
		"ffmpeg",
		"-i",
		`${cwd}/public/anime/${folderName}/video`,
		"-c:v",
		"h264",
		"-f",
		"hls",
		"-hls_list_size",
		"0",
		`${cwd}/public/anime/${folderName}/video.m3u8`,
	]);

	await rm(`${cwd}/public/anime/${folderName}/video`);
};

import { S3, S3Client } from "@aws-sdk/client-s3";

const r2 = new S3Client({
	region: "auto",
	endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
	credentials: {
		accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
		secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
	},
});

const b0131 = new S3({
	region: "garage",
	endpoint: "https://nyancat0131.moe",
	credentials: {
		accessKeyId: process.env.B0131_ACCESS_KEY_ID || "",
		secretAccessKey: process.env.B0131_SECRET_ACCESS_KEY || "",
	},
	requestChecksumCalculation: "WHEN_REQUIRED",
});

b0131.middlewareStack.add(
	(next, _) => (args) => {
		(args.request as Record<string, Record<string, string>>).headers.Origin =
			"https://jibunrest.art";
		return next(args);
	},
	{
		step: "finalizeRequest",
	},
);

export default r2;
export { b0131 };

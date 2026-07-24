import Elysia, { t } from "elysia";
import { getConnection } from "../connection";
import { privillage, token } from "../middleware";
import { ROLE } from "../types";

type LiveChannelDto = {
	event_id: string;
	broadcast_id: number;
	id?: number;
	channel_id?: string | null;
	channel_name?: string | null;
	stream_type?: "hls" | "dash" | "whep";
	url?: string | null;
	forward_url?: string | null;
	cookies?: string | null;
	headers?: string | null;
};

export const insertChannel = async (
	{ id, event_id, broadcast_id, ...props }: LiveChannelDto,
	update = false,
) => {
	try {
		const [entry] = await getConnection().query(
			"SELECT * FROM `live_channels` WHERE id=?",
			[id],
		);

		if (update && !entry) return null;

		const {
			channel_id: _channel_id,
			channel_name: _channel_name,
			stream_type: _stream_type,
			url: _url,
			forward_url: _forward_url,
			cookies: _cookies,
			headers: _headers,
		} = entry ?? {};

		const {
			channel_id = _channel_id ?? null,
			channel_name = _channel_name ?? null,
			stream_type = _stream_type ?? "hls",
			url = _url ?? null,
			forward_url = _forward_url ?? null,
			cookies = _cookies ?? null,
			headers = _headers ?? null,
		} = props;

		await getConnection().query(
			update
				? "UPDATE `live_channels` SET channel_id=?, channel_name=?, stream_type=?, url=?, forward_url=?, cookies=?, headers=? WHERE id=?"
				: "INSERT INTO `live_channels` (channel_id, channel_name, stream_type, url, forward_url, cookies, headers, event_id, broadcast_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
			[
				channel_id,
				channel_name,
				stream_type,
				url,
				forward_url,
				cookies,
				headers,
				...(!update ? [event_id, broadcast_id] : []),
				...(update ? [id] : []),
			],
		);

		return {
			id,
			event_id,
			broadcast_id,
			channel_id,
			channel_name,
			stream_type,
			url,
			forward_url,
			cookies,
			headers,
		};
	} catch (e) {
		console.error(e);
		return null;
	}
};

const channels = new Elysia().group("/:broadcast_id/channels", (app) =>
	app
		.group("", (app) =>
			app
				.use(privillage)
				.post(
					"/",
					async ({
						params: { slug, broadcast_id },
						body: { channel_id, channel_name },
						status,
					}) => {
						const result = await insertChannel({
							event_id: slug,
							broadcast_id: +broadcast_id,
							channel_id,
							channel_name,
						});

						if (!result) return status(500, "Cannot create archive");
						return status(200, result);
					},
					{
						params: t.Object({
							slug: t.String(),
							broadcast_id: t.Number(),
						}),
						body: t.Object({
							channel_id: t.String(),
							channel_name: t.Optional(t.String()),
						}),
					},
				)
				.patch(
					"/:id",
					async ({ params: { slug, broadcast_id, id }, body, status }) => {
						const result = await insertChannel(
							{
								id,
								event_id: slug,
								broadcast_id: +broadcast_id,
								...body,
							},
							true,
						);

						if (!result) return status(500, "Cannot update archive");
						return status(200, result);
					},
					{
						params: t.Object({
							slug: t.String(),
							broadcast_id: t.Number(),
							id: t.Number(),
						}),
						body: t.Object({
							channel_id: t.Optional(t.Nullable(t.String())),
							channel_name: t.Optional(t.Nullable(t.String())),
							stream_type: t.Optional(t.UnionEnum(["hls", "dash", "whep"])),
							url: t.Optional(t.Nullable(t.String())),
							forward_url: t.Optional(t.Nullable(t.String())),
							cookies: t.Optional(t.Nullable(t.String())),
							headers: t.Optional(t.Nullable(t.String())),
						}),
					},
				)
				.delete(
					"/:id",
					async ({ params: { id }, status }) => {
						try {
							await getConnection().query(
								"DELETE FROM `live_channels` WHERE id=?",
								[id],
							);
							return status(200, "Success");
						} catch (e) {
							console.error(e);
							return status(500, "Internal Server Error");
						}
					},
					{
						params: t.Object({
							slug: t.String(),
							broadcast_id: t.Number(),
							id: t.Number(),
						}),
					},
				),
		)
		.group("", (app) =>
			app
				.use(token)
				.get(
					"/:id",
					async ({ params: { id }, status, userData }) => {
						try {
							const [entry] = await getConnection().query(
								userData.role === ROLE.ADMIN
									? "SELECT * FROM `live_channels` WHERE id=?"
									: "SELECT id, channel_id, channel_name, url, stream_type FROM `live_channels` WHERE id=?",
								id,
							);

							if (!entry) return status(404, "Not Found");
							return status(200, entry);
						} catch (e) {
							console.error(e);
							return status(500, "Cannot get archive");
						}
					},
					{
						params: t.Object({
							slug: t.String(),
							broadcast_id: t.Number(),
							id: t.Number(),
						}),
					},
				)
				.get(
					"/",
					async ({ status, params: { slug, broadcast_id }, userData }) => {
						try {
							const entries = await getConnection().query(
								userData.role === ROLE.ADMIN
									? "SELECT * FROM live_channels WHERE event_id=? AND broadcast_id=?"
									: "SELECT id, channel_id, channel_name, url, stream_type FROM live_channels WHERE event_id=? AND broadcast_id=?",
								[slug, broadcast_id],
							);
							return status(200, entries);
						} catch (e) {
							console.error(e);
							return status(500, "Internal Server Error");
						}
					},
					{
						params: t.Object({
							slug: t.String(),
							broadcast_id: t.Number(),
						}),
					},
				)
				.post(
					"/:id/drm",
					async ({ body, status, params: { id } }) => {
						try {
							const [entry] = await getConnection().query(
								"SELECT * FROM `live_channels` WHERE id=?",
								[id],
							);
							if (!entry) return status(404, "Not Found");

							const licenseUrl = process.env.X_LICENSE ?? "";
							const response = await fetch(licenseUrl, {
								method: "POST",
								body: body as ArrayBuffer,
								headers: {
									"content-type": "application/octet-stream",
									[process.env.X_S_LABEL as string]: process.env.X_S as string,
								},
							});

							if (!response.ok) {
								console.log(await response.json());
								throw new Error("Cannot request key");
							}

							const res = await response.arrayBuffer();
							return status(200, res);
						} catch (e) {
							console.error(e);
							return status(500, "Error hehe");
						}
					},
					{
						params: t.Object({
							slug: t.String(),
							broadcast_id: t.Number(),
							id: t.Number(),
						}),
						body: t.Optional(t.Any()),
					},
				)
				.get(
					"/:id/forward/:resource",
					async ({ params: { id, resource }, status }) => {
						try {
							const [entry] = await getConnection().query(
								"SELECT * FROM `live_channels` WHERE id=?",
								[id],
							);
							if (!entry) return status(404, "Not Found");

							const customHeaders = Object.entries(
								JSON.parse(entry.headers || "{}"),
							).reduce<Record<string, string>>((accm, [key, value]) => {
								accm[key] = JSON.stringify(value);
								return accm;
							}, {});

							const response = await fetch(`${entry.forward_url}/${resource}`, {
								method: "GET",
								headers: {
									cookie: entry.cookies,
									...customHeaders,
								},
							});

							return status(response.status, response);
						} catch (e) {
							console.error(e);
							return status(500, "Error hehe");
						}
					},
					{
						params: t.Object({
							slug: t.String(),
							broadcast_id: t.Number(),
							id: t.Number(),
							resource: t.String(),
						}),
					},
				),
		),
);

export default channels;

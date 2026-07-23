import axios from "axios";
import Elysia, { t } from "elysia";
import { DateTime } from "luxon";
import { getConnection } from "../connection";
import { privillage, token } from "../middleware";
import { ROLE } from "../types";
import channels, { insertChannel } from "./channels";

type LiveArchiveDto = {
	event_id: string;
	id?: number;
	broadcast_slug?: string;
	broadcast_name?: string;
	broadcast_date?: Date | null;
	public?: boolean | null;
};

export const refreshArchive = async ({
	slug,
	broadcast_id,
}: {
	slug: string;
	broadcast_id: number;
}) => {
	try {
		const [event] = await getConnection().query(
			"SELECT * FROM `live_events` WHERE slug=?",
			[slug],
		);
		const [entry] = await getConnection().query(
			"SELECT * FROM `live_archives` WHERE id=?",
			[broadcast_id],
		);
		if (!entry || !event) return null;

		const {
			data: { archives },
		} = await axios.get(
			`${process.env.X_BASE_URL}/${slug}/${process.env.X_ARCHIVES}`,
		);
		const archive = archives.find(
			(a: LiveArchiveDto) => a.broadcast_slug === entry.broadcast_slug,
		);
		if (!archive) return null;

		const broadcast_name = archive.broadcast_name;
		const broadcast_slug = archive.broadcast_slug;
		const broadcast_date = archive.performance_date
			? DateTime.fromFormat(archive.performance_date, "yyyy-MM-dd", {
					zone: "utc",
				}).toJSDate()
			: DateTime.fromISO(event.date).toJSDate();

		const result = await insertArchive(
			{
				id: broadcast_id,
				event_id: slug,
				broadcast_date,
				broadcast_slug,
				broadcast_name,
				public: entry.public,
			},
			true,
		);

		if (!result) return null;

		await getConnection().query(
			"DELETE FROM `live_channels` WHERE broadcast_id=?",
			[broadcast_id],
		);

		for (const channel of archive.channels) {
			const channel_name = channel.channel_name;
			const channel_id = channel.chennel_vspf_id;

			try {
				await insertChannel({
					event_id: slug,
					broadcast_id: entry.id,
					channel_id,
					channel_name,
				});
			} catch (e) {
				console.error(e);
				console.error(
					`Cannot insert channel with channel_id ${channel.chennel_vspf_id} for archive ${archive.broadcast_slug} of slug ${slug}`,
				);
			}
		}

		return {
			...entry,
			broadcast_date,
			broadcast_slug,
			broadcast_name,
		};
	} catch (e) {
		console.error(e);
		return null;
	}
};

export const insertArchive = async (
	{ id, event_id, ...props }: LiveArchiveDto,
	update = false,
) => {
	try {
		const [entry] = await getConnection().query(
			"SELECT * FROM `live_archives` WHERE id=?",
			[id],
		);

		if (update && !entry) return null;

		const {
			broadcast_slug: _broadcast_slug,
			broadcast_name: _broadcast_name,
			broadcast_date: _broadcast_date,
			public: _public,
		} = entry ?? {};

		const {
			broadcast_slug = _broadcast_slug ?? null,
			broadcast_name = _broadcast_name ?? null,
			broadcast_date = _broadcast_date ?? null,
			public: __public = _public ?? false,
		} = props;

		await getConnection().query(
			update
				? "UPDATE `live_archives` SET broadcast_slug=?, broadcast_name=?, broadcast_date=?, public=? WHERE id=?"
				: "INSERT INTO `live_archives` (broadcast_slug, broadcast_name, broadcast_date, event_id) VALUES (?, ?, ?, ?)",
			[
				broadcast_slug,
				broadcast_name,
				broadcast_date,
				__public,
				...(!update ? [event_id] : []),
				...(update ? [id] : []),
			],
		);

		return {
			id,
			event_id,
			broadcast_slug,
			broadcast_name,
			broadcast_date,
		};
	} catch (e) {
		console.error(e);
		return null;
	}
};

const archives = new Elysia().group("/:slug/archives", (app) =>
	app
		.group("", (app) =>
			app
				.use(privillage)
				.post(
					"/",
					async ({
						params: { slug },
						body: { broadcast_slug, broadcast_name, broadcast_date },
						status,
					}) => {
						const result = await insertArchive({
							event_id: slug,
							broadcast_slug,
							broadcast_name,
							broadcast_date,
						});

						if (!result) return status(500, "Cannot create archive");
						return status(200, result);
					},
					{
						params: t.Object({
							slug: t.String(),
						}),
						body: t.Object({
							broadcast_slug: t.String(),
							broadcast_name: t.Optional(t.String()),
							broadcast_date: t.Optional(t.Date()),
						}),
					},
				)
				.post(
					"/:broadcast_id/refresh",
					async ({ status, params: { slug, broadcast_id } }) => {
						const archive = await refreshArchive({ slug, broadcast_id });
						if (!archive) return status(500, "Internal Server Error");
						return status(200, archive);
					},
					{
						params: t.Object({
							slug: t.String(),
							broadcast_id: t.Number(),
						}),
					},
				)
				.patch(
					"/:broadcast_id",
					async ({ params: { slug, broadcast_id: id }, body, status }) => {
						const result = await insertArchive(
							{
								id,
								event_id: slug,
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
						}),
						body: t.Object({
							broadcast_slug: t.Optional(t.String()),
							broadcast_name: t.Optional(t.String()),
							broadcast_date: t.Optional(t.Date()),
							public: t.Optional(t.Boolean()),
						}),
					},
				)
				.delete(
					"/:broadcast_id",
					async ({ params: { broadcast_id: id }, status }) => {
						try {
							await getConnection().query(
								"DELETE FROM `live_archives` WHERE id=?",
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
						}),
					},
				),
		)
		.get(
			"/:broadcast_id",
			async ({ params: { broadcast_id: id }, status }) => {
				try {
					const [entry] = await getConnection().query(
						"SELECT * FROM `live_archives` WHERE id=?",
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
				}),
			},
		)
		.group("", (app) =>
			app.use(token).get(
				"/",
				async ({ status, params: { slug }, userData }) => {
					try {
						const entries = await getConnection().query(
							userData.role === ROLE.ADMIN
								? "SELECT * FROM live_archives WHERE event_id=?"
								: "SELECT * FROM live_archives WHERE event_id=? AND public=TRUE",
							[slug],
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
					}),
				},
			),
		)

		.use(channels),
);

export default archives;

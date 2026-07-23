import axios from "axios";
import Elysia, { t } from "elysia";
import { DateTime } from "luxon";
import { getConnection } from "../connection";
import { privillage, token } from "../middleware";
import archives, { insertArchive } from "./archives";
import { insertChannel } from "./channels";

type LiveEventDto = {
	slug: string;
	name?: string | null;
	ip_slug?: string | null;
	event_slug?: string | null;
	date?: Date | null;
	thumbnail?: string | null;
};

const insertEvent = async (
	{ slug, ...props }: LiveEventDto,
	update = false,
) => {
	try {
		const [entry] = await getConnection().query(
			"SELECT * FROM `live_events` WHERE slug=?",
			slug,
		);

		if (update && !entry) return null;

		const {
			name: _name,
			ip_slug: _ip,
			event_slug: _event,
			date: _date,
			thumbnail: _thumb,
		} = entry ?? {};

		const {
			name = _name ?? null,
			ip_slug = _ip ?? null,
			event_slug = _event ?? null,
			date = _date ?? null,
			thumbnail = _thumb ?? null,
		} = props;

		await getConnection().query(
			update
				? "UPDATE `live_events` SET name=?, thumbnail=?, date=?, ip_slug=?, event_slug=? WHERE slug=?"
				: "INSERT INTO `live_events` (name, thumbnail, date, ip_slug, event_slug, slug) VALUES (?, ?, ?, ?, ?, ?)",
			[name, thumbnail, date, ip_slug, event_slug, slug],
		);

		return {
			slug,
			name,
			thumbnail,
			date,
			ip_slug,
			event_slug,
		};
	} catch (e) {
		console.error(e);
		return null;
	}
};

const events = new Elysia().group("/events", (app) =>
	app
		.group("", (app) =>
			app
				.use(privillage)
				.post(
					"/import",
					async ({ body: { slug }, status }) => {
						try {
							const { data: event } = await axios.get(
								`${process.env.X_BASE_URL}/${slug}/${process.env.X_EVENTS}`,
							);
							const {
								data: { archives },
							} = await axios.get(
								`${process.env.X_BASE_URL}/${slug}/${process.env.X_ARCHIVES}`,
							);

							const ip_slug = event.ip_slug;
							const event_name = event.event_name;
							const event_slug = event.event_slug;
							const event_thumbnail_image = event.event_thumbnail_image;
							const event_start_date = event.event_start_date.split(" ").at(0);

							const eventData = {
								slug,
								name: event_name,
								ip_slug,
								event_slug,
								thumbnail: event_thumbnail_image,
								date: DateTime.fromISO(event_start_date).toJSDate(),
							};

							const result = await insertEvent(eventData);

							for (const archive of archives) {
								try {
									const broadcast_name = archive.broadcast_name;
									const broadcast_slug = archive.broadcast_slug;
									const broadcast_date = archive.performance_date
										? DateTime.fromFormat(
												archive.performance_date,
												"yyyy-MM-dd",
												{
													zone: "utc",
												},
											).toJSDate()
										: DateTime.fromISO(event_start_date).toJSDate();

									await insertArchive({
										event_id: slug,
										broadcast_slug,
										broadcast_name,
										broadcast_date,
									});

									const [entry] = await getConnection().query(
										"SELECT id FROM `live_archives` WHERE event_id=? AND broadcast_slug=?",
										[slug, broadcast_slug],
									);

									if (!entry) continue;

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
								} catch (e) {
									console.error(e);
									console.error(
										`Cannot insert archive with broadcast_slug ${archive.broadcast_slug}for slug ${slug}`,
									);
								}
							}

							if (!result) return status(500, "Cannot import slug data");
							return status(200, result);
						} catch (e) {
							console.error(e);
							console.error(`Cannot get archive for slug ${slug}`);
							return status(500, "Cannot import slug data");
						}
					},
					{
						body: t.Object({
							slug: t.String(),
						}),
					},
				)
				.post(
					"/",
					async ({ body: { slug, name }, status }) => {
						const result = await insertEvent({
							slug,
							name,
						});

						if (!result) return status(500, "Cannot create event");
						return status(200, result);
					},
					{
						body: t.Object({
							slug: t.String(),
							name: t.Optional(t.String()),
						}),
					},
				)
				.patch(
					"/:slug",
					async ({ params: { slug }, body, status }) => {
						const result = await insertEvent(
							{
								slug,
								...body,
							},
							true,
						);

						if (!result) return status(500, "Cannot update event");
						return status(200, result);
					},
					{
						params: t.Object({
							slug: t.String(),
						}),
						body: t.Object({
							name: t.Optional(t.String()),
							ip_slug: t.Optional(t.String()),
							event_slug: t.Optional(t.String()),
							thumbnail: t.Optional(t.String()),
							date: t.Optional(t.Date()),
						}),
					},
				)
				.delete(
					"/:slug",
					async ({ params: { slug }, status }) => {
						try {
							await getConnection().query(
								"DELETE FROM `live_events` WHERE slug=?",
								[slug],
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
						}),
					},
				),
		)
		.get(
			"/:slug",
			async ({ params: { slug }, status }) => {
				try {
					const [entry] = await getConnection().query(
						"SELECT * FROM `live_events` WHERE slug=?",
						slug,
					);

					if (!entry) return status(404, "Not Found");
					return status(200, entry);
				} catch (e) {
					console.error(e);
					return status(500, "Cannot get event");
				}
			},
			{
				params: t.Object({
					slug: t.String(),
				}),
			},
		)
		.group("", (app) =>
			app.use(privillage).get("/", async ({ status }) => {
				try {
					const entries = await getConnection().query(
						"SELECT * FROM live_events ORDER BY date DESC",
					);
					return status(200, entries);
				} catch (e) {
					console.error(e);
					return status(500, "Internal Server Error");
				}
			}),
		)
		.use(archives),
);

export default events;

import jwt from "@elysiajs/jwt";
import { Elysia, t } from "elysia";

export const jwtAccess = new Elysia({
    name: "jwtAccess"
}).use(jwt({
    name: "jwtAccess",
    schema: t.Object({
        id: t.String(),
    }),
    secret: process.env.JWT_ACCESS_SECRET as string,
    exp: "7d"
}));

export const jwtRefresh = new Elysia({
    name: "jwtRefresh"
}).use(jwt({
    name: "jwtRefresh",
    schema: t.Object({
        id: t.String(),
    }),
    secret: process.env.JWT_REFRESH_SECRET as string,
    exp: "1y"
}));
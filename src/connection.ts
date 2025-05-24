import mariadb from "mariadb";
import { MongoClient } from "mongodb";

const pool = mariadb.createPool({
	host: process.env.DATABASE_HOST,
	user: process.env.DATABASE_USER,
	password: process.env.DATABASE_PWD,
	database: process.env.DATABASE_DB,
	allowPublicKeyRetrieval: true
});

const uri = `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PWD}@${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/${process.env.MONGO_PARAMS}`;
const client = new MongoClient(uri);
await client.connect();

export function getConnection() {
	return pool;
}

export function getMongoConnection() {
	return client;
}

import { getConnection } from "./connection";
import md5 from "md5";
import { ROLE } from "./types";

const checkToken = async (token?: string) => {
	if (!token) return false;
	const hashed = md5(token);

	const [user] = await getConnection().query(
		"SELECT (uid) FROM hash_token WHERE hash=?",
		[hashed],
	);
	if (!user) return false;

	const [userData] = await getConnection().query(
		"SELECT (joined) FROM users WHERE id=?",
		[user.uid],
	);
	if (!userData.joined) return false;

	return user.uid;
};

const checkPrivillage = async (token?: string) => {
	if (!token) return false;
	const hashed = md5(token);

	const [user] = await getConnection().query(
		"SELECT (uid) FROM hash_token WHERE hash=?",
		[hashed],
	);
	if (!user) return false;

	const [userData] = await getConnection().query(
		"SELECT (role) FROM users WHERE id=?",
		[user.uid],
	);
	if (userData.role !== ROLE.ADMIN) return false;

	return user.uid;
};

export default checkToken;
export { checkPrivillage };

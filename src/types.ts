export enum SOCKET_ENUM {
	NEW_MESSAGE = "NEW_MESSAGE",
	UPDATE_USERCOUNT = "UPDATE_USERCOUNT",
	NEW_USER = "NEW_USER",
	USER_STATE = "USER_STATE",
	PING = "PING"
}

export type Message = {
	username: string;
	global_name: string;
	avatar: string;
	id: string;
	time: number;
	content: string;
};

export enum State {
	JOIN = "JOIN",
	LEAVE = "LEAVE",
}

export type JoinLeaveMessage = {
	username: string;
	state: State;
};

export type Viewer = {
	username: string;
    id: string;
	global_name: string;
};

export enum ROLE {
	NORMAL = 0,
	ADMIN = 1
}
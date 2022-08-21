import dotenv from 'dotenv';
dotenv.config();

interface Config {
	discordToken: string;
	databaseUri?: string;
	privateChatServerID: string;
	coreServerId: string;
}

export let config: Config;
export function getConfig() {
	return config as Config;
}

export function loadConfig() {
	const { discordToken, CORE_DATABASE, GUILD_PRIVATE_CHATS, GUILD_CORE } = process.env;

	if (!(discordToken && GUILD_PRIVATE_CHATS && GUILD_CORE)) {
		throw Error('Requires all of `discordToken` `private chat ID` `core ID` from environment variables.');
	}

	config = {
		discordToken,
		privateChatServerID: GUILD_PRIVATE_CHATS,
		coreServerId: GUILD_CORE,
		databaseUri: CORE_DATABASE,
	};
}

import { Client } from 'discord.js';
import dotenv from 'dotenv';
dotenv.config();

interface Config {
	discordToken: string;
	databaseUri?: string;
	privateChatServerID: string;
	coreServerId: string;
	client?: Client;
	PORT: string;
	prismaDatabaseURI: string;
}

export let config: Config;
export function getConfig() {
	return config as Config;
}

export function loadConfig() {
	const { discordToken, CORE_DATABASE, GUILD_PRIVATE_CHATS, GUILD_CORE, PORT, prismaDatabaseURI } = process.env;

	if (!(discordToken && GUILD_PRIVATE_CHATS && GUILD_CORE && prismaDatabaseURI)) {
		throw Error('Requires all of `discordToken` `private chat ID` `core ID` `prismaDatabaseURI` from environment variables.');
	}

	config = {
		discordToken,
		privateChatServerID: GUILD_PRIVATE_CHATS,
		coreServerId: GUILD_CORE,
		databaseUri: CORE_DATABASE,
		PORT: PORT ?? '3001',
		prismaDatabaseURI,
	};
}

import { Client, Intents } from 'discord.js';
import { loadCommands } from './structures/SlashCommand';
import axios from 'axios';
import mongoose from 'mongoose';

import { loadListeners } from './discord';
import { getConfig, loadConfig, config } from './config';

axios.defaults.baseURL = 'http://localhost:3001/v1/';

loadConfig();

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_PRESENCES] });
client.on('ready', async () => {
	const { databaseUri, coreServerId, privateChatServerID } = getConfig();
	config.client = client;

	if (!databaseUri) console.log('Database URI not supplied.');
	else
		mongoose
			.connect(databaseUri)
			.then(() => console.log('DB Connected'))
			.catch((e) => console.log('DB not connected', e));

	loadCommands(client, 'core', coreServerId);
	loadCommands(client, 'confessionals', privateChatServerID);

	loadListeners(client);
});

client.login(getConfig().discordToken);

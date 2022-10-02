import { Client, Intents } from 'discord.js';
import { loadCommands } from './structures/SlashCommand';
import axios from 'axios';
import mongoose from 'mongoose';
import { loadListeners } from './discord';
import { getConfig, loadConfig, config } from './config';
import express, { json } from 'express';
import cors from 'cors';
import protocol from 'http';
import apiRouter from './routes/apiRoute';
import { loadSVGFiles } from './util/svgUtils';
import path from 'path';

axios.defaults.baseURL = 'http://localhost:3001/v1/';

loadConfig();

const app = express();
const server = protocol.createServer(app);

app.use(cors({}));
app.use(json());
app.use('/', apiRouter);

server.listen(config.PORT, async () => {
	console.log(`Connecting to port [${config.PORT}]`);
	const { databaseUri, coreServerId, privateChatServerID, PORT } = getConfig();

	if (!databaseUri) console.log('Database URI not supplied.');
	else
		await mongoose
			.connect(databaseUri)
			.then(() => console.log('DB Connected'))
			.catch((e) => console.log('DB not connected', e));

	await client.login(config.discordToken);
});

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_PRESENCES] });
client.on('ready', async () => {
	const { databaseUri, coreServerId, privateChatServerID } = getConfig();
	config.client = client;
	loadCommands(client, 'core', coreServerId);
	loadCommands(client, 'confessionals', privateChatServerID);
	loadListeners(client);

	loadSVGFiles(path.join(__dirname, 'res', 'svg'));
});

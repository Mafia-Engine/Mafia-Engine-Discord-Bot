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
import { SlashCommand } from './systems/SlashCommand';
import { PrismaClient } from '@prisma/client';

axios.defaults.baseURL = 'http://localhost:3001/v1/';

loadConfig();

const app = express();
const server = protocol.createServer(app);
export const prisma = new PrismaClient();

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

	const coreGuild = client.guilds.cache.get(config.coreServerId);
	const confessionalGuild = client.guilds.cache.get(config.privateChatServerID);

	SlashCommand.loadCommands(path.join(__dirname, 'cmd'), {
		game: coreGuild.commands,
		confessionals: confessionalGuild.commands,
	});

	loadListeners(client);
	loadSVGFiles(path.join(__dirname, 'res', 'svg'));
});

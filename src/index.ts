import { Channel, Client, Intents, Message, TextBasedChannel } from 'discord.js';
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
import Button from './systems/Buttons';

axios.defaults.baseURL = 'http://localhost:3001/v1/';

loadConfig();

const app = express();
const server = protocol.createServer(app);
export const prisma = new PrismaClient({ datasources: { db: { url: config.prismaDatabaseURI } } });

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

export async function restartClient(channel?: TextBasedChannel) {
	let message: Message;
	if (channel) message = await channel.send('Restarting...');
	client.destroy();
	await client.login(config.discordToken);
	if (channel) message.edit('Restart worked');
}

client.on('ready', async () => {
	config.client = client;
	const coreGuild = client.guilds.cache.get(config.coreServerId);
	const confessionalGuild = client.guilds.cache.get(config.privateChatServerID);
	await SlashCommand.loadCommands(path.join(__dirname, 'interactions', 'commands'), {
		game: coreGuild.commands,
		confessionals: confessionalGuild.commands,
	});
	await Button.loadButtons(path.join(__dirname, 'interactions', 'buttons'));

	loadListeners(client);
	loadSVGFiles(path.join(__dirname, 'res', 'svg'));
});

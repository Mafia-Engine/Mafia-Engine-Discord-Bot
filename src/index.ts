import dotenv from 'dotenv';
import { Client, Intents } from 'discord.js';
import { loadCommands, loadListeners } from './structures/SlashCommand';
import axios from 'axios';
import mongoose from 'mongoose';

axios.defaults.baseURL = 'http://localhost:3001/v1/';

dotenv.config();
const { discordToken, GUILD_PRIVATE_CHATS, GUILD_CORE } = process.env;

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_MESSAGES] });
client.on('ready', async () => {
	if (!process.env.CORE_DATABASE) console.log('Database URI not supplied.');
	else
		mongoose
			.connect(process.env.CORE_DATABASE)
			.then(() => console.log('DB Connected'))
			.catch((e) => console.log('DB not connected', e));

	loadCommands(client, 'core', GUILD_CORE);
	loadCommands(client, 'confessionals', GUILD_PRIVATE_CHATS);
	loadListeners(client);
});

client.login(discordToken);

import dotenv from 'dotenv';
import {  Client, Intents } from 'discord.js';
import { loadCommands } from './structures/SlashCommand';
import axios from 'axios'
import mongoose from 'mongoose';

axios.defaults.baseURL = 'http://localhost:3001/v1/'

dotenv.config();
const { discordToken } = process.env;

const client = new Client({intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_MESSAGES]});
client.on('ready', async () => {
	if (!process.env.CORE_DATABASE) console.log('Database URI not supplied.');
	else mongoose.connect(process.env.CORE_DATABASE).then(()=>console.log('DB Connected')).catch(() => console.log('DB not connected'));
	const loadedCommands = loadCommands(client);
	console.log(`Ready.\nCommands Loaded: ${loadedCommands}`);
});

client.login(discordToken);
import dotenv from 'dotenv';
import {  Client, Intents } from 'discord.js';
import { loadCommands, loadListeners } from './structures/SlashCommand';
import axios from 'axios'
import mongoose from 'mongoose';

axios.defaults.baseURL = 'http://localhost:3001/v1/'

dotenv.config();
const { discordToken } = process.env;
const SERVER_ID_CORE = '648663810772697089';
const SERVER_ID_CONFESSIONALS = '990547469203038238'
const SERVER_ID_PLAYER_CHATS = '753231987589906483'

const client = new Client({intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_MESSAGES]});
client.on('ready', async () => {
	if (!process.env.CORE_DATABASE) console.log('Database URI not supplied.');
	else mongoose.connect(process.env.CORE_DATABASE).then(()=>console.log('DB Connected')).catch((e) => console.log('DB not connected', e));

	loadCommands(client, SERVER_ID_CORE, 'core')
	loadCommands(client, SERVER_ID_CONFESSIONALS, 'confessionals');
	loadCommands(client, SERVER_ID_PLAYER_CHATS, 'confessionals');
	loadListeners(client);
});

client.login(discordToken);
import { Client, Interaction } from 'discord.js';
import fs from 'fs';
import path from 'path';
import { BaseEvent } from './structures/Event';

import interactionCreate from './events/interactionCreate';
// import guildMemberUpdate from './events/guildMemberUpdate';

function getFilesFromDirectory(path: string, callback: (handles: string[]) => void) {
	let result: string[] = [];
	fs.readdir(path, (err, files) => {
		if (err) {
			console.log('Unable to scan directory: ' + err);
			return null;
		}
		files.forEach((file) => {
			result.push(file);
		});

		callback(result);
	});
}

export function loadListeners(client: Client) {
	try {
		client.on('interactionCreate', interactionCreate);

		// const importPath = path.join(__dirname, 'events');
		// getFilesFromDirectory(importPath, async (handles: string[]) => {
		// 	for (let i = 0; i < handles.length; i++) {
		// 		const handle = handles[i];
		// 		const eventHandle = handle.split('.')[0];
		// 		const rootRaw = await require(path.join(importPath, handle));
		// 		const root = rootRaw.default;

		// 		const EventFunction = root as BaseEvent;
		// 		const runEvent = (i: Interaction) => {
		// 			console.log('Event Called -> ' + eventHandle + ` [${i.guild.id}]`);
		// 			try {
		// 				EventFunction(i);
		// 			} catch (err) {
		// 				console.log(err);
		// 			}
		// 		};

		// 		client.on(eventHandle, runEvent);
		// 		console.log(`Event [${eventHandle}] loaded.`);
		// 	}
		// });
	} catch (err) {}
}

export function loadCommands() {}

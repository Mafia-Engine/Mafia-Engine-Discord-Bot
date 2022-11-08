import Discord, { CommandInteraction, ApplicationCommandOptionData, Interaction, Client, MessageEmbed, Permissions, Message, ButtonInteraction, MessageMentions, Guild, ApplicationCommandPermissionData, SelectMenuInteraction, TextChannel } from 'discord.js';
import path from 'path';
import fs from 'fs';

type ServerType = 'core' | 'confessionals';

export const ServerList: Record<string, Record<string, SlashCommand>> = {};
const getCommands = (path: string, callback: (handles: string[]) => void) => {
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
};

type SlashCommandManager = Discord.GuildApplicationCommandManager | Discord.ApplicationCommandManager<Discord.ApplicationCommand<{ guild: Discord.GuildResolvable }>, { guild: Discord.GuildResolvable }, null> | undefined;
const addCommandToGuild = (slashCommandManager: SlashCommandManager, { name, description, commandData, permissions }: SlashCommand, type?: ServerType) => {
	if (!slashCommandManager) return console.log(`Command [${name}] failed to load${type ? ` on server ${type}` : '.'}`);
	slashCommandManager.create({ name, description, options: commandData });
	console.log(`Command [${name}] loaded${type ? ` on server ${type}` : '.'}`);
};

export const loadCommands = (client: Client, type: ServerType, serverID?: string): boolean => {
	if (!serverID) return false;

	const guild = client.guilds.cache.get(serverID);
	if (!guild) return false;

	const slashCommandManager: SlashCommandManager = guild ? guild.commands : client.application?.commands;
	if (!slashCommandManager) return false;

	console.log(type, guild?.name);
	ServerList[serverID] = {};

	try {
		// addCommandToGuild(slashCommandManager, LFG);
		const importPath = path.join(__dirname, '..', 'commands');
		getCommands(path.join(importPath, type), async (handles: string[]) => {
			for (let i = 0; i < handles.length; i++) {
				const raw = await require(path.join(importPath, type, handles[i]));
				const slashCommand = raw.slashCommand;
				if (!ServerList[serverID][slashCommand.name]) {
					ServerList[serverID][slashCommand.name] = slashCommand;
					addCommandToGuild(slashCommandManager, slashCommand, type);
				} else console.log(`Slash command, ${slashCommand.name}, has a naming conflict`);
			}
		});

		// });
	} catch (err) {
		console.log(err);
		return false;
	}

	return true;
};

interface SlashCommandFunction {
	(i: CommandInteraction): void;
}

type ReplyType = 'Default' | 'Ephemeral';

export interface SlashCommand {
	name: string;
	replyType?: ReplyType;
	description: string;
	commandData: ApplicationCommandOptionData[];
	permissions?: ApplicationCommandPermissionData[];
	commandFunction: SlashCommandFunction;
}

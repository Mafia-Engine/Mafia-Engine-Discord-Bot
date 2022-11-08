import Discord, { ApplicationCommandOption, ApplicationCommandOptionData, CommandInteraction } from 'discord.js';
import fs from 'fs';
import path from 'path';

export type SlashHandle = string;
export type SlashFunction = (i: CommandInteraction) => Promise<any> | any;
export type ServerType = 'game' | 'confessionals';
type SlashCommandManager = Discord.GuildApplicationCommandManager | Discord.ApplicationCommandManager<Discord.ApplicationCommand<{ guild: Discord.GuildResolvable }>, { guild: Discord.GuildResolvable }, null> | undefined;

export class SlashCommand {
	public static commands: Record<SlashHandle, SlashCommand> = {};
	public static async loadCommands(dirPath: string, guilds?: Record<ServerType, SlashCommandManager>) {
		const result = fs.readdirSync(dirPath);
		if (!result) throw Error('Unable to load slash commands.');
		for (let i = 0; i < result.length; i++) {
			// The above will trigger the .publish() of any files.
			await require(path.join(dirPath, result[i]));
		}

		for (const commandHandle in SlashCommand.commands) {
			const command = SlashCommand.commands[commandHandle];
			const { serverTypes, name, description, options } = command;

			for (const type of serverTypes) {
				const guild = guilds[type];
				if (guild) {
					guild.create({ name, description, options: options });
					console.log(`Command [${name}] loaded${type ? ` on server ${type}` : '.'}`);
				}
			}
		}
	}

	private name: string;
	private description: string;
	private slashFunction: SlashFunction | undefined;
	private serverTypes: ServerType[] = [];
	private options: ApplicationCommandOptionData[] = [];

	constructor(name: string, description: string) {
		console.log(name, 'Loaded.');
		this.name = name;
		this.description = description;
	}
	setSlashFunction(slashFunc: SlashFunction) {
		this.slashFunction = slashFunc;
		return this;
	}
	setServerTypes(serverTypes: ServerType | ServerType[]) {
		if (typeof serverTypes == 'string') this.serverTypes = [serverTypes];
		else this.serverTypes = serverTypes;
		return this;
	}
	addOption(option: ApplicationCommandOption) {
		this.options.push(option);
		return this;
	}
	addOptions(options: ApplicationCommandOption[]) {
		this.options = [].concat(this.options, options);
		return this;
	}
	publish() {
		SlashCommand.commands[this.name] = this;
		return this;
	}
	run(i: CommandInteraction) {
		this.slashFunction(i);
	}
}

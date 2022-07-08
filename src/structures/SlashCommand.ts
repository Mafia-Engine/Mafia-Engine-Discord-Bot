import Discord, { CommandInteraction, ApplicationCommandOptionData, Interaction, Client, MessageEmbed, Permissions, Message, ButtonInteraction, MessageMentions, Guild } from 'discord.js';
import path from 'path';
import fs from 'fs';
import { UserGroup } from '../database/LFG';
import { LFGSchema } from '../database/LFG';
import { createButtons, createEmbed, getLFGData, LFGQueryData } from "../structures/LookingForGroup";


type ServerType = 'core' | 'confessionals';

const ServerList: Record<string, Record<string, SlashCommand>> = {};
const getCommands = (path: string, callback: (handles: string[])=>void) => {
    let result: string[] = [];
    fs.readdir(path, (err, files) => {
        if (err) {
            console.log('Unable to scan directory: ' + err);
            return null;


        }
        files.forEach((file) => {
            result.push(file);
        })

        callback(result);
    })
}

type SlashCommandManager = Discord.GuildApplicationCommandManager | Discord.ApplicationCommandManager<Discord.ApplicationCommand<{ guild: Discord.GuildResolvable; }>, {guild: Discord.GuildResolvable; }, null> | undefined
const addCommandToGuild = (slashCommandManager: SlashCommandManager, { name, description, commandData}: SlashCommand, type?: ServerType) => {
    if (!slashCommandManager) return console.log(`Command [${name}] failed to load${type ? ` on server ${type}` : '.'}`)
    slashCommandManager.create({ name, description, options: commandData })
    console.log(`Command [${name}] loaded${type ? ` on server ${type}` : '.'}`)

}

export const loadListeners = (client: Client) => {
    client.on('interactionCreate', (i: Interaction) => {
        if (!i.guildId) return;
        if (!i.isCommand()) return;
        const command: SlashCommand | undefined = ServerList[i.guildId][i.commandName];
        if (command) command.commandFunction(i);
    });

    client.on('interactionCreate', async (inter: Interaction) => {
        if (!inter.isButton()) return;
        const i: ButtonInteraction = inter;

        if (i.customId.startsWith('lfg-button-')) {
            const button = i.customId.substring('lfg-button-'.length, i.customId.length);
            let message = i.message as Message;
            const embed: MessageEmbed = message.embeds[0] as MessageEmbed;
            if (!embed) return;
            try {
                const anError = (id: number) => {
                    return i.reply({ content: 'An error has occurred with ID of ' + id, ephemeral: true })
                }
    
                const ID = embed.footer?.text;
                if (!ID) return anError(1);
                const fetchedLFG = await LFGSchema.findOne({ identifier: ID });
                if (!fetchedLFG) return anError(2);


                const userGroups: Record<string, UserGroup> = {};
                fetchedLFG.userGroups.forEach((v: UserGroup) => userGroups[v.title] = v);

                const requestedUserGroup = userGroups[button];
                let canJoin: boolean | null = false;
                if (!requestedUserGroup) {
                    for (const groupName in userGroups) {
                        const group = userGroups[groupName];
                        group.users = group.users.filter((val) => val != i.user.id);
                    }
                } else {
                    if (requestedUserGroup.max)
                        canJoin = requestedUserGroup.max > requestedUserGroup.users.length;
                    else  
                        canJoin = true;
                    if (!canJoin && canJoin !== null) return i.deferUpdate(); //i.reply({ content: 'Requested group cannot be joined. ', ephemeral: true });

                    for (const groupName in userGroups) {
                        const group = userGroups[groupName];
                        group.users = group.users.filter((val) => val != i.user.id);
                        if (groupName === button)
                            group.users.push(i.user.id);
                    }
                }

                

                fetchedLFG.userGroups = Object.values(userGroups);
                const saved = await fetchedLFG.save();

                const embeds = [createEmbed(saved)];
                const components = [createButtons(saved)];
                i.update({ embeds, components })
            } catch (err) {
                console.log(err);
                return i.reply({ content: 'An error has occurred with ID of ' + 0, ephemeral: true })
            }
        }


        if (i.customId.startsWith('vote-button-view-')) {
            const button = i.customId.substring('vote-button-view-'.length, i.customId.length);
            const message = i.message as Message;

            const anError = (id: number) => {
                return i.reply({ content: `<@${i.user.id}>, an error occurred when doing your request. [1]`, ephemeral: true })
            }

            const data: string[] = button.split('-');
            if (data.length == 0) return anError(1);


            const firstUser = i.guild?.members.cache.get(data[0]);
            const secondUser = i.guild?.members.cache.get(data[1]);

            if (!firstUser) return anError(2);

            let messageValue = null;
            if (!secondUser) messageValue = `${firstUser.displayName} has unvoted.`;
            else messageValue = `${firstUser.displayName} has voted ${secondUser.displayName}`;

            if (!null) return i.reply({ content: messageValue, ephemeral: true})
            return i.reply({ content: `<@${i.user.id}>, an error occurred when doing your request. [2]`, ephemeral: true });
        }
        
    })

    client.on('interactionCreate', async (i: Interaction) => {
        if (!i.isButton()) return;
    })
}

export const loadCommands = (client: Client, serverID: string, type: ServerType): boolean=> {
    const guild = client.guilds.cache.get(serverID);
    if (!guild) return false;

    const slashCommandManager: SlashCommandManager = guild ? guild.commands : client.application?.commands;
    if (!slashCommandManager) return false;

    console.log(type, guild?.name)
    ServerList[serverID] = {};

    try {
        const importPath = path.join(__dirname, '..', 'commands');
        getCommands(path.join(importPath, type), async (handles: string[]) => {
            for (let i = 0; i < handles.length; i++) {
                const root = await require(path.join(importPath, type, handles[i]));
                const slashCommand = root.slashCommand as SlashCommand;
                if (!ServerList[serverID][slashCommand.name]) {
                    ServerList[serverID][slashCommand.name] = slashCommand;
                    addCommandToGuild(slashCommandManager, slashCommand, type);
                } else console.log(`Slash command, ${slashCommand.name}, has a naming conflict`)
            }
        })
    } catch (err) {
        console.log(err);
        return false;
    }



    return true;
}


interface SlashCommandFunction {
    (i: CommandInteraction): void;
}

export interface SlashCommand {
    name: string;
    description: string;
    commandData: ApplicationCommandOptionData[];
    commandFunction: SlashCommandFunction;
}

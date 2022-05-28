import { CommandInteraction, ApplicationCommandOptionData, Interaction, Client, MessageEmbed, Permissions, Message } from 'discord.js';
import { slashCommand as LFG } from '../commands/lookingforgroup'
import { createEmbed, getLFGFromEmbed } from './LookingForGroup';

const commands: Record<string, SlashCommand> = {
    'lookingforgroup': LFG
};

export const loadCommands = (client: Client): boolean=> {
    const guild = client.guilds.cache.get('648663810772697089');
    const slashCommandManager = guild ? guild.commands : client.application?.commands;

    if (!slashCommandManager) return false;

    for (const command of Object.values(commands) as SlashCommand[]) {
        slashCommandManager.create({
            name: command.name,
            description: command.description,
            options: command.commandData
        })
    }

    client.on('interactionCreate', (i: Interaction) => {
        if (!i.isCommand()) return;
        const command: SlashCommand | undefined = commands[i.commandName];
        if (command) command.commandFunction(i);
    });

    client.on('interactionCreate', async (i: Interaction) => {
        if (!i.isButton()) return;
        if (!i.customId.startsWith('lfg-button-')) return;

        const button = i.customId.substring('lfg-button-'.length, i.customId.length);

        let message = i.message as Message;
        let messageID = message.id;

        const embed: MessageEmbed = message.embeds[0] as MessageEmbed;
        if (!embed) return;

        const embedData = getLFGFromEmbed(embed);
        if (!embedData || !embedData.userGroups) return;

        for (const group of embedData.userGroups) {
            const unique = (val: string, index: number, self: string[]) => self.indexOf(val) === index;
            const remove = (val: string) => val != i.user.id;

            if (button == 'leave') group.users = group.users.filter(remove);
            else if (group.title.toLowerCase() == button) group.users.push(i.user.id);
            else group.users = group.users.filter(remove)

            group.users = group.users.filter(unique);
            console.log('Group Users:', group.users);
        }

        const newEmbed = createEmbed(embedData);

        message.edit({embeds: [newEmbed]});
        i.message.embeds[0] = newEmbed;

        await i.deferReply();
        // await i.reply({content: button + ' ' + messageID, ephemeral: true});
        await i.deleteReply();
    })

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

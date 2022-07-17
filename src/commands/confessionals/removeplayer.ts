import { CategoryChannel, CommandInteraction, TextChannel} from "discord.js";
import { ConfessionalsRaw, ConfessionalsSchema, IndividualConfessional, updateChannelPermissions } from "../../database/Confessionals";
import { SlashCommand } from "../../structures/SlashCommand";

export const slashCommand: SlashCommand = {
    name: 'remove',
    description: '[HOST] Remove a player/confessional.',
    commandData: [
        {
            name: 'channel',
            description: 'Remove a player based from their confessional channel (will delete the channel)',
            type: 'CHANNEL',
            required: true
        },
        {
            name: 'user',
            description: 'Remove a player based from their account (will delete the channel)',
            type: 'STRING',
            required: false
        }
    ],

    commandFunction: async (i: CommandInteraction) => {
        await i.deferReply().catch(console.log);
        await i.editReply('This command has not been fully made yet').catch(console.log);
    }
}
import { CategoryChannel, CommandInteraction, TextChannel} from "discord.js";
import { ConfessionalsRaw, ConfessionalsSchema, IndividualConfessional, updateChannelPermissions } from "../../database/Confessionals";
import { SlashCommand } from "../../structures/SlashCommand";

export const slashCommand: SlashCommand = {
    name: 'nuke',
    description: '[ADMIN] Deletes an entire category, BE VERY CAREFUL',
    commandData: [
        {
            name: 'channel',
            description: 'Removes channels category and all categories children.',
            type: 'CHANNEL',
            required: true
        }
    ],

    commandFunction: async (i: CommandInteraction) => {
        await i.deferReply().catch(console.log);
        if (!i.memberPermissions || !i.memberPermissions.has('ADMINISTRATOR')) return i.editReply({
            content: 'You need to be an Administrator or higher to access this command.'
        }).catch(console.log);

        try {
            const channel = i.options.getChannel('channel', true) as TextChannel;
            const category = channel.parent;
            if (!category) return await i.editReply({ content: 'An error has occurred when trying to find the player chat category.'}).catch(console.log);
            category.children.forEach(channel => channel.delete())
            category.delete();
            return await i.followUp('Successfully nuked category');

        } catch (err) {
            console.log(err);
            return await i.followUp('Error occurred when nuking category.');
        }

    }
}
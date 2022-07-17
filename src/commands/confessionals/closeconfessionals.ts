import { CategoryChannel, CommandInteraction, TextChannel} from "discord.js";
import { ConfessionalsRaw, ConfessionalsSchema } from "../../database/Confessionals";
import { SlashCommand } from "../../structures/SlashCommand";

export const slashCommand: SlashCommand = {
    name: 'closeconfessionals',
    description: '[STAFF] Close player confessionals for a game.',
    commandData: [
        {
            name: 'category',
            description: 'Category of which the game is being run in.',
            type: 'STRING',
            choices: [
                {
                    name: 'Main',
                    value: 'ma'
                },
                {
                    name: 'Special',
                    value: 'sp'
                },
                {
                    name: 'Newcomer',
                    value: 'ne'
                },
                {
                    name: 'Community',
                    value: 'co'
                }
            ],
            required: true
        },
        {
            name: 'number',
            description: 'Number ID of the game within the category',
            type: 'INTEGER',
            required: true
        }
    ],

    commandFunction: async (i: CommandInteraction) => {
        await i.deferReply().catch(console.log);
        if (!i.memberPermissions || !i.memberPermissions.has('ADMINISTRATOR')) return i.editReply({
            content: 'You need to be an Administrator or higher to access this command.'
        }).catch(console.log);

        const guild = i.guild;
        if (!guild) return await i.editReply('An error has occurred with an ID of [1]')

        const category = i.options.getString('category', true);
        const number = i.options.getInteger('number', true);
        const gameTag = (category + number).toLowerCase();
       
        try {
            const fetchConfessional = await ConfessionalsSchema.findOne({ gameTag });
            if (!fetchConfessional) return await i.editReply({ content: `Confessional does not exist with the gametag ${gameTag}`}).catch(console.log);

            const category = guild.channels.cache.get(fetchConfessional.hostPanelId) as CategoryChannel;
            if (!category) return await i.editReply({ content: 'An error has occurred when trying to find the confessionals category.'}).catch(console.log);
            category.children.forEach(channel => channel.delete())
            category.delete();

            const deletionData = await ConfessionalsSchema.deleteOne({ gameTag });
            if (deletionData.deletedCount > 0) i.editReply('Confessionals have been removed.').catch(console.log);
            else i.editReply('Database entry could not be deleted.').catch(console.log);

        } catch (err) {
            console.log(err);
            await i.editReply({ content: 'An error has occurred with an ID of [0]'}).catch(console.log);
        }

    }
}
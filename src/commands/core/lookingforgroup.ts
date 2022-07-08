import { CommandInteraction, Message, MessageActionRow, MessageButton, MessageEmbed } from "discord.js";
import { SlashCommand } from "../../structures/SlashCommand";
import { createButtons, createEmbed, getLFGData, LFGQueryData } from "../../structures/LookingForGroup";
import { LFGRawData, LFGSchema, LookingForGroupData } from "../../database/LFG";

export const slashCommand: SlashCommand = {
    name: 'lookingforgroup',
    description: 'Open a LFG embed within a given channel or the current channel.',
    commandData: [
        {
            name: 'title',
            description: 'Title of the LFG',
            type: 'STRING',
            required: false
        },
        {
            name: 'players',
            description: 'Maximum amount of players - ignore for unlimited.',
            type: 'INTEGER',
            required: false
        },
        {
            name: 'backups',
            description: 'Maximum amount of backups - ignore for unlimited.',
            type: 'INTEGER',
            required: false
        },
        {
            name: 'discussion',
            description: 'Open a thread for discussion.',
            type: 'BOOLEAN',
            required: false
        }
    ],

    commandFunction: async (i: CommandInteraction) => {
        await i.deferReply({ephemeral: true});
        if (!i.memberPermissions || !i.memberPermissions.has('ADMINISTRATOR')) return i.reply({
            content: 'You need to be an Administrator or higher to access this command.',
            ephemeral: true
        });

        const playerCount = i.options.getInteger('players');
        const backupCount = i.options.getInteger('backups');
        const hasDiscussion = i.options.getBoolean('discussion');
        const title = i.options.getString('title');

        const channel = i.channel;
        if (!channel) return i.reply({
            content: 'What',
            ephemeral: true
        })

        try {
            const lfgData: LookingForGroupData = {
                identifier: i.id,
                name: title || 'Looking For Group',
                description: 'Click on the appropriate buttons to join a group.',
                userGroups: [
                    {
                        title: 'players',
                        users: [],
                        position: 1,
                        max: playerCount || undefined
                    },
                    {
                        title: 'backups',
                        users: [],
                        position: 2,
                        max: backupCount || undefined
                    }
                ]
            }

            const saveLFG = new LFGSchema(lfgData);
            await saveLFG.save();

            const embed = createEmbed(saveLFG);
            const buttons = createButtons(saveLFG);

            const message = await channel.send({ embeds: [embed], components: [buttons]} )

            if (hasDiscussion) {
                message.startThread({
                    name: `Discussion ${title ? `- ${title}` : ''}`,
                    autoArchiveDuration: "MAX"
                })
            }

            i.editReply({ content: 'LFG has been created.'})
        } catch (err) {
            console.log(err);
        }
    }
}
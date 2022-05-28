import { CommandInteraction, MessageActionRow, MessageButton, MessageEmbed } from "discord.js";
import { SlashCommand } from "../structures/SlashCommand";
import { createButtons, createEmbed, getLFGData, LFGQueryData } from "../structures/LookingForGroup";
import { LFGRawData, LFGSchema, LookingForGroupData } from "../database/LFG";

export const slashCommand: SlashCommand = {
    name: 'lookingforgroup',
    description: 'Open a LFG embed within a given channel or the current channel.',
    commandData: [
        {
            name: 'custom',
            description: 'Use custom parameters to create the embed.',
            type: 'BOOLEAN',
            required: false
        }
    ],

    commandFunction: async (i: CommandInteraction) => {
        await i.deferReply();
        if (!i.memberPermissions || !i.memberPermissions.has('ADMINISTRATOR')) return i.reply({
            content: 'You are not an admin, bitch',
            ephemeral: true
        });

        const channel = i.channel;
        if (!channel) return i.reply({
            content: 'What',
            ephemeral: true
        })

        const message = await channel.send({
            content: 'Mafia Engine is thinking...'
        })

        try {
            const newLFG: LookingForGroupData = {
                identifier: message.id,
                name: 'Looking For Group',
                description: 'Click on the appropriate buttons to join a group.',
                userGroups: [
                    {
                        title: 'players',
                        users: []
                    },
                    {
                        title: 'backups',
                        users: []
                    }
                ]
            };

            const embed = createEmbed(newLFG);
            const buttons = createButtons(newLFG);

            message.edit({ content: null, embeds: [embed], components: [buttons] });
        } catch (err) {
            console.log(err);
        }

        await i.deleteReply();
        
        // try {
      

        //     await newLFG.save();
        //     message.edit({content: null, embeds: []})

        // } catch (err) {
        //     console.log(err);
        // }

        // const lfgData = await getLFGData({});
        // const embed = createEmbed(lfgData);
        // const buttons = createButtons(lfgData);

        // const data = {
        //     embeds: [embed],
        //     components: [buttons]
        // }

        // const channel = i.channel;
        // if (channel)  {
        //     i.channel.send(data);
        //     await i.deleteReply();
        // }

        
        // else await i.reply(data);
    }
}
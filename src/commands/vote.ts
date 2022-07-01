import { CommandInteraction, MessageActionRow, MessageButton, MessageEmbed, TextChannel } from "discord.js";
import { SlashCommand } from "../structures/SlashCommand";
import { createButtons, createEmbed, getLFGData, LFGQueryData } from "../structures/LookingForGroup";
import { LFGRawData, LFGSchema, LookingForGroupData } from "../database/LFG";
import { GameSchema } from "../database/Game";

export const slashCommand: SlashCommand = {
    name: 'vote',
    description: 'Change your vote within a Mafia game.',
    commandData: [
        {
            name: 'player',
            description: 'Player you wish to vote.',
            type: 'USER',
            required: false
        },
        {
            name: 'unvote',
            description: 'Remove your vote (overrides all other options)',
            type: 'BOOLEAN',
            required: false
        }
    ],

    commandFunction: async (i: CommandInteraction) => {
        await i.deferReply();
        const { channelId } = i;
        const votedPlayer = i.options.getUser('player');
        const votedUnvote = i.options.getBoolean('unvote');

        try {
            const fetchGame = await GameSchema.findOne({ gameChannel: channelId });
            if (!fetchGame) await i.editReply({
                content: 'You cannot use this commands outside of a registered game.'            });
            const voteChannelId = fetchGame.voteChannel;
            const anError = () => i.editReply({ content: 'An error has occurred.' });
            if (!i.guild) return anError();
            const voteChannel: TextChannel = i.guild.channels.cache.get(voteChannelId) as TextChannel;
            if (!voteChannel) return anError();

            
            let voteMessage = '';

            if (votedUnvote) voteMessage = `<@${i.user.id}> has removed their vote.`;
            else if (votedPlayer) voteMessage = `<@${i.user.id}> has voted for <@${votedPlayer.id}>`;

            if (voteMessage != '') {
                voteChannel.send({ content: voteMessage, allowedMentions: { users: [] }});
                return i.editReply({ content: voteMessage, allowedMentions: { users: [] } });
            }

            return i.editReply({content: 'An error has occurred. Vote change was not counted'})
        } catch (err) {
            
        }
    }
}
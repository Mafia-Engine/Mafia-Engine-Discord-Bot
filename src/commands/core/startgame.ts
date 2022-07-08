import { CommandInteraction, MessageActionRow, MessageButton, MessageEmbed } from "discord.js";
import { Game, GameSchema } from "../../database/Game";
import { SlashCommand } from "../../structures/SlashCommand";

export const slashCommand: SlashCommand = {
    name: 'startgame',
    description: '[STAFF] Register a game.',
    commandData: [
        {
            name: 'chat',
            description: 'Main chat channel',
            type: 'CHANNEL',
            required: true
        },
        {
            name: 'vote',
            description: 'Main vote channel',
            type: 'CHANNEL',
            required: true
        }
    ],

    commandFunction: async (i: CommandInteraction) => {
        await i.deferReply({ ephemeral: true });
        if (!i.memberPermissions || !i.memberPermissions.has('ADMINISTRATOR')) return i.reply({
            content: 'You need to be an Administrator or higher to access this command.',
            ephemeral: true
        });

        try {
            const chatValue = i.options.getChannel('chat', true);
            const voteValue = i.options.getChannel('vote', true);

            const throwOverlap = () => i.editReply({ content: 'Either chat or vote channels already exist in a game.' })

            const hasChat = await GameSchema.findOne({ gameChannel: chatValue.id });
            if (hasChat) return throwOverlap();

            const hasVote = await GameSchema.findOne({ voteChannel: voteValue.id });
            if (hasVote) return throwOverlap();


            const newGameData: Game = {
                gameChannel: chatValue.id,
                voteChannel: voteValue.id
            }

            const newGame = new GameSchema(newGameData);
            newGame.save();
            i.editReply({ content: `Game created with <#${chatValue.id}> and <#${voteValue.id}>`});
        } catch (err) {
            await i.editReply({ content: 'An error has occurred' });
            console.log(err);
        }
        
    }
}
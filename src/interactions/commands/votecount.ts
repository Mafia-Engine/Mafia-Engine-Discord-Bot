import { Constants, MessageEmbed } from 'discord.js';
import { prisma } from '../..';
import { SlashCommand } from '../../systems/SlashCommand';

export default new SlashCommand('votecount', 'Load a votecount')
	.setServerTypes(['game'])
	.setSlashFunction(async (i) => {
		await i.deferReply();

		const currentChannel = i.channelId;
		const voteCounter = await prisma.voteCounter.findUnique({
			where: {
				gameChannel: currentChannel,
			},
			include: {
				gameSlots: true,
			},
		});

		if (!voteCounter)
			i.editReply({
				content: 'There is no vote counter in this channel',
			});

		const replyMessage = voteCounter.gameSlots.map((slot) => {
			const { currentPlayer } = slot;
			return `<@${currentPlayer}>\n`;
		});

		await i.editReply({
			content: `Imagine a votecount here.\nAll players\n${replyMessage}`,
		});
	})
	.publish();

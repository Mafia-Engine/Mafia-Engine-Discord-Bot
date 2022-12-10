import { Constants, MessageEmbed } from 'discord.js';
import { prisma } from '../..';
import { SlashCommand } from '../../systems/SlashCommand';

export default new SlashCommand('createvotecount', 'Host commands')
	.setServerTypes(['game'])
	.addOptions([
		{
			type: 'CHANNEL',
			name: 'gamechannel',
			required: true,
			description: 'Channel of which the game resides',
		},
		{
			type: 'STRING',
			name: 'lfg',
			description: 'ID for the LFG you wish to extract the players for',
			required: true,
		},
	])
	.setSlashFunction(async (i) => {
		const gameChannel = i.options.getChannel('gamechannel', true);
		const lfgID = i.options.getString('lfg', true);

		const alreadyExistant = await prisma.voteCounter.findFirst({
			where: {
				gameChannel: gameChannel.id,
			},
		});

		if (alreadyExistant) return i.reply('Votecounter already exists in that channel.');

		const userGroup = await prisma.userGroup.findFirst({
			where: {
				lfg: {
					identifier: lfgID,
				},
				title: 'players',
			},
			include: { lfg: true },
		});

		if (!userGroup) return await i.reply({ content: 'No such user group can be found' });

		const { users } = userGroup;
		// for (const user of users) {
		// 	await prisma.gameSlot.create({
		// 		data: {
		// 			currentPlayer: user,
		// 			voteCounter: {
		// 				connectOrCreate: {
		// 					where: {
		// 						gameChannel: gameChannel.id,
		// 					},
		// 					create: {
		// 						gameChannel: gameChannel.id,
		// 					},
		// 				},
		// 			},
		// 		},
		// 	});
		// }

		const doubleCheck = await prisma.voteCounter.findUnique({
			where: {
				gameChannel: gameChannel.id,
			},
			include: {
				gameSlots: true,
			},
		});

		console.log('Checked', doubleCheck);

		return await i.reply({ content: `Vote Counter should be set up.` });
	})
	.publish();

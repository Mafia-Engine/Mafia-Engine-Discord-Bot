import { prisma } from '../..';
import { createEmbed, createButtons } from '../../structures/LookingForGroup';
import { SlashCommand } from '../../systems/SlashCommand';

export default new SlashCommand('lookingforgroup', 'Open a LFG embed within a given channel or the current channel.')
	.setServerTypes('game')
	.addOptions([
		{
			name: 'title',
			description: 'Title of the LFG',
			type: 'STRING',
			required: false,
		},
		{
			name: 'players',
			description: 'Maximum amount of players - ignore for unlimited.',
			type: 'INTEGER',
			required: false,
		},
		{
			name: 'backups',
			description: 'Maximum amount of backups - ignore for unlimited.',
			type: 'INTEGER',
			required: false,
		},
		{
			name: 'spectators',
			description: 'Maximum amount of spectators - ignore for none',
			type: 'INTEGER',
			required: false,
		},
		{
			name: 'discussion',
			description: 'Open a thread for discussion.',
			type: 'BOOLEAN',
			required: false,
		},
	])
	.setSlashFunction(async (i) => {
		await i.deferReply({ ephemeral: true }).catch(console.log);

		let allowed = i.user.id === '416757703516356628' || !(!i.memberPermissions || !i.memberPermissions.has('ADMINISTRATOR'));

		if (!allowed)
			return i
				.editReply({
					content: 'You need to be an Administrator or higher to access this command.',
				})
				.catch(console.log);

		const playerCount = i.options.getInteger('players');
		const backupCount = i.options.getInteger('backups');
		const hasSpectators = i.options.getInteger('backups');
		const hasDiscussion = i.options.getBoolean('discussion');
		const title = i.options.getString('title');

		const channel = i.channel;
		if (!channel)
			return i
				.reply({
					content: 'What',
					ephemeral: true,
				})
				.catch(console.log);

		try {
			const newLFG = await prisma.lookingForGroup.create({
				include: {
					userGroups: true,
				},
				data: {
					identifier: i.id,
					name: title ?? 'Looking for Group',
					description: 'Click on the appropriate buttons to join a group.',
					userGroups: {},
				},
			});

			await prisma.userGroup.create({
				data: {
					title: 'players',
					users: [],
					position: 1,
					max: playerCount ?? undefined,
					lfg: {
						connect: {
							id: newLFG.id,
						},
					},
				},
			});

			await prisma.userGroup.create({
				data: {
					title: 'backups',
					users: [],
					position: 2,
					max: backupCount ?? undefined,
					lfg: {
						connect: {
							id: newLFG.id,
						},
					},
				},
			});

			if (hasSpectators)
				await prisma.userGroup.create({
					data: {
						title: 'spectators',
						users: [],
						position: 3,
						max: undefined,
						lfg: {
							connect: {
								id: newLFG.id,
							},
						},
					},
				});

			const fetchedNewLFG = await prisma.lookingForGroup.findUnique({
				where: {
					id: newLFG.id,
				},
				include: {
					userGroups: true,
				},
			});

			if (!fetchedNewLFG) return await i.editReply({ content: 'An error has occurred. Try again? ' });

			const embed = createEmbed(fetchedNewLFG);
			const buttons = createButtons(fetchedNewLFG);

			const message = await channel.send({ embeds: [embed], components: [buttons] });

			if (hasDiscussion) {
				message.startThread({
					name: `Discussion ${title ? `- ${title}` : ''}`,
					autoArchiveDuration: 'MAX',
				});
			}

			i.editReply({ content: 'LFG has been created.' }).catch(console.log);
		} catch (err) {
			console.log(err);
		}
	})
	.publish();

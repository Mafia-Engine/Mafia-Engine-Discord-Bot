import { LookingForGroupData, LFGSchema } from '../database/LFG';
import { createEmbed, createButtons } from '../structures/LookingForGroup';
import { SlashCommand } from '../systems/SlashCommand';

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
			const lfgData: LookingForGroupData = {
				identifier: i.id,
				name: title || 'Looking For Group',
				description: 'Click on the appropriate buttons to join a group.',
				userGroups: [
					{
						title: 'players',
						users: [],
						position: 1,
						max: playerCount || undefined,
					},
					{
						title: 'backups',
						users: [],
						position: 2,
						max: backupCount || undefined,
					},
				],
			};

			if (hasSpectators) {
				lfgData.userGroups.push({
					title: 'spectators',
					users: [],
					position: 3,
					max: 45,
				});
			}

			const saveLFG = new LFGSchema(lfgData);
			await saveLFG.save();

			const embed = createEmbed(saveLFG);
			const buttons = createButtons(saveLFG);

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

import { MessageEmbed } from 'discord.js';
import { SlashCommand } from '../../systems/SlashCommand';

export default new SlashCommand('invite', 'View invite links for all associated servers.')
	.setServerTypes(['game', 'confessionals'])
	.addOption({
		name: 'server',
		description: 'Which server do you want an invite for?',
		type: 'STRING',
		required: true,
		choices: [
			{
				name: 'Red Dice',
				value: 'https://discord.gg/dReQD6CWjH',
			},
			{
				name: 'Blue Dice',
				value: 'https://discord.gg/4ygmH7b',
			},
		],
	})
	.addOption({
		name: 'reveal',
		description: 'Send this publicly (ignore or FALSE for just yourself)',
		type: 'BOOLEAN',
		required: false,
	})
	.setSlashFunction(async (i) => {
		const link = i.options.getString('server', true);
		const ephemeral = !(i.options.getBoolean('reveal') ?? false);

		await i.reply({
			content: link,
			ephemeral,
		});
	})
	.publish();

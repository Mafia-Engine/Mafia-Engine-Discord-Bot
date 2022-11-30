import { MessageEmbed, User } from 'discord.js';
import { SlashCommand } from '../../systems/SlashCommand';

export default new SlashCommand('registergame', 'Register a game.')
	.setServerTypes(['confessionals'])
	.addOptions([
		{
			name: 'category',
			description: 'Category of which the game is being run in.',
			type: 'STRING',
			choices: [
				{
					name: 'Main',
					value: 'ma',
				},
				{
					name: 'Special',
					value: 'sp',
				},
				{
					name: 'Newcomer',
					value: 'ne',
				},
				{
					name: 'Community',
					value: 'co',
				},
			],
			required: true,
		},
		{
			name: 'number',
			description: 'Number ID of the game within the category',
			type: 'INTEGER',
			required: true,
		},
		{
			name: 'host',
			description: 'Host for the game',
			type: 'USER',
			required: true,
		},
		{
			name: 'cohost',
			description: 'Co-host for the game. If you require more hosts, add them via the /addhost command afterwards.',
			type: 'USER',
			required: false,
		},
		{
			name: 'name',
			description: 'Name for the game, keep it as condensed as possible.',
			type: 'STRING',
			required: false,
		},
	])
	.setSlashFunction(async (i) => {
		const lfgID: string = '123456789';

		const category = i.options.getString('category', true);
		const number = i.options.getNumber('number', true);
		const host = i.options.getUser('host', true);
		const cohost: User = i.options.getUser('cohost', false);

		const gameTag = (category + number).toLowerCase();
		const hosts: User[] = [host];
		if (cohost) hosts.push(cohost);

		/*
            1. Create category with title of the game tag.
            2. Create #host-panel under category.
            3. Place appropriate embed within it.
        */

		await i.reply('Registered.');
	})
	.publish();

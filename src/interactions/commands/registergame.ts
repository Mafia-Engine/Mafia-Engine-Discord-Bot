import { MessageEmbed, Constants } from 'discord.js';
import { SlashCommand } from '../../systems/SlashCommand';
const Colors = Constants.Colors;

export default new SlashCommand('registergame', 'Register a game through the bot, allowing use for all game resources for hosts.')
	.setServerTypes(['game'])
	.addOptions([
		{
			name: 'host',
			description: 'Main host, or one of the co-hosts.',
			type: 'USER',
			required: true,
		},
		{
			name: 'queue',
			description: 'Which queue is the game running in?',
			type: 'STRING',
			required: true,
			choices: [
				{ name: 'Main', value: 'ma' },
				{ name: 'Special', value: 'sp' },
				{ name: 'Newbie', value: 'ne' },
				{ name: 'Community', value: 'co' },
			],
		},
		{
			name: 'number',
			description: 'What is the queue number for the game.',
			type: 'INTEGER',
			required: true,
		},
	])
	.setSlashFunction(async (i) => {
		const o = i.options;
		const mainHost = o.getUser('host', true);
		const queue = o.getString('queue', true);
		const number = o.getInteger('number', true);

		const gameTag = `${queue}${number}`;
		let e = new MessageEmbed();

		const gameExists: boolean = false; // Fetch
		if (gameExists) {
			e.setTitle('Game Registration - Failure');
			e.setColor(Colors.RED);
			e.addField('Reason', `Game is already registered under the tag \`${gameTag}\``);
			return i.reply({ embeds: [e] });
		}

		// 1. Create game on DB
		// 2. Create category on confessional server
		// 3. Create host-panel in new category.

		const hostPanelChannelID = 'placeholderID';
		e.setTitle('Game Registration - Success');
		e.setColor(Colors.GREEN);
		e.addField('Reason', 'Development lol');
		e.addField('Details', `Host/s: <@${mainHost.id}>\nGame Tag: ${gameTag.toUpperCase()}`);
		e.addField('Host Channel', `<#${hostPanelChannelID}>`);

		i.reply({ embeds: [e] });
	})
	.publish();

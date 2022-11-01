import { CommandInteraction, Constants, MessageActionRow, MessageButton, MessageEmbed, TextChannel } from 'discord.js';
import { SlashCommand } from '../../structures/SlashCommand';
import { faker } from '@faker-js/faker';
import { LookingForGroupData } from '../../database/LFG';
import { createEmbed, createButtons } from '../../structures/LookingForGroup';

enum WinConditions {
	Town = 'You win when there are no longer any threats to the Town.',
}

export const slashCommand: SlashCommand = {
	name: 'roles',
	description: 'See a standardised role.',
	commandData: [],

	commandFunction: async (i: CommandInteraction) => {
		let players: string[] = [];
		let backups: string[] = [];
		let specs: string[] = [];

		for (let i = 0; i < 45; i++) {
			players.push('135784580077715458');
			backups.push('416757703516356628');
			specs.push('739519254201761793');
		}

		const lfgData: LookingForGroupData = {
			identifier: i.id,
			name: 'Looking For Group Test',
			description: 'Click on the appropriate buttons to join a group.',
			userGroups: [
				{
					title: 'players',
					users: players,
					position: 1,
					max: 45,
				},
				{
					title: 'backups',
					users: backups,
					position: 2,
					max: 45,
				},
				{
					title: 'spectators',
					users: specs,
					position: 3,
					max: 45,
				},
			],
		};

		const embed = createEmbed(lfgData);
		const buttons = createButtons(lfgData);

		i.reply({ embeds: [embed], components: [buttons] });
		// const embed = new MessageEmbed()
		// 	.setColor(Constants.Colors.GREEN)
		// 	.setTitle('Vigilante')
		// 	.setDescription('*flavour here*')
		// 	.setFields([
		// 		{
		// 			name: 'Abilities',
		// 			value: 'Each night, you may kill a player of your choosing.',
		// 		},
		// 		{
		// 			name: 'Mechanics',
		// 			value: '- You have 3 bullets.\n- If you kill a Town member, you will lose the ability to shoot.',
		// 		},
		// 		{
		// 			name: 'Win Condition',
		// 			value: WinConditions.Town,
		// 		},
		// 	])
		// 	.setURL('https://discord-mafia-role-cards.fandom.com/wiki/Vigilante');

		// await i.reply({ embeds: [embed] });
	},
};

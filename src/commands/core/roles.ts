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
		const embed = new MessageEmbed()
			.setColor(Constants.Colors.GREEN)
			.setTitle('Vigilante')
			.setDescription('*flavour here*')
			.setFields([
				{
					name: 'Abilities',
					value: 'Each night, you may kill a player of your choosing.',
				},
				{
					name: 'Mechanics',
					value: '- You have 3 bullets.\n- If you kill a Town member, you will lose the ability to shoot.',
				},
				{
					name: 'Win Condition',
					value: WinConditions.Town,
				},
			])
			.setURL('https://discord-mafia-role-cards.fandom.com/wiki/Vigilante')
			.setThumbnail('https://static.wikia.nocookie.net/town-of-salem/images/a/a6/RoleIcon_Vigilante.png/revision/latest?cb=20200910205115');

		// .setThumbnail('https://wiki.mafiascum.net/images/thumb/a/a6/T-vigilante.png/380px-T-vigilante.png/');

		await i.reply({ embeds: [embed] });
	},
};

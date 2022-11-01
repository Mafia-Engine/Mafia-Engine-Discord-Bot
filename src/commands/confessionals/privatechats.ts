import { CommandInteraction, MessageEmbed, Constants, Guild, MessageActionRow, MessageButton, GuildMember } from 'discord.js';
import { SlashCommand } from '../../structures/SlashCommand';
// import prisma from '../../database';
// import { User } from '@prisma/client';
// import { createCitizenship } from '../../util/Citizenship';

export const slashCommand: SlashCommand = {
	name: 'privatechats',
	description: 'Manage private chats.',
	commandData: [
		{
			name: 'create',
			description: 'Create a private chat group.',
			type: 'SUB_COMMAND',
			options: [
				{
					name: 'gametag',
					description: 'Tag of which to identify the game (e.g. MA15)',
					type: 'STRING',
					required: true,
				},
			],
		},
	],

	commandFunction: async (i: CommandInteraction) => {},
};

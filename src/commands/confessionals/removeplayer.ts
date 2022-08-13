import { SelectMenuBuilder } from '@discordjs/builders';
import { CategoryChannel, CommandInteraction, MessageActionRow, MessageSelectMenu, MessageSelectOptionData, TextChannel } from 'discord.js';
import { ConfessionalsRaw, ConfessionalsSchema, IndividualConfessional, updateChannelPermissions } from '../../database/Confessionals';
import { SlashCommand } from '../../structures/SlashCommand';

import { UnsafeSelectMenuOptionBuilder } from '@discordjs/builders';

export const slashCommand: SlashCommand = {
	name: 'remove',
	description: '[HOST] Delete a player-chat',
	commandData: [],

	commandFunction: async (i: CommandInteraction) => {
		await i.deferReply({ ephemeral: true }).catch(console.log);
		const channel = i.channel as TextChannel;
		if (channel.name !== 'host-panel') return i.editReply('You cannot use this command outside of the dedicated host panel.').catch(console.log);

		try {
			const fetchedConfessional = await ConfessionalsSchema.findOne({ hostPanelId: channel.parentId });
			if (!fetchedConfessional) return await i.editReply('Cannot find a stored player chats linked to this category.').catch(console.log);

			let allPlayers: MessageSelectOptionData[] = [];
			if (fetchedConfessional.confessionals) {
				for (let i = 0; i < fetchedConfessional.confessionals.length; i++) {
					const val: IndividualConfessional = fetchedConfessional.confessionals[i];
					const user = await channel.guild.members.fetch(val.user);

					let username = user.displayName;

					const data: MessageSelectOptionData = {
						label: username,
						value: user.id,
					};

					allPlayers.push(data);
				}

				const row = new MessageActionRow().addComponents(new MessageSelectMenu().setCustomId('remove-players').setPlaceholder('Select users to remove').setOptions(allPlayers).setMinValues(1));

				await i.editReply({ components: [row] });
			} else {
				await i.editReply({ content: `Error fetching player chats from the database` });
			}
		} catch (err) {
			console.log(err);
			await i.editReply(`An unexpected error has occurred.`).catch(console.log);
		}
	},
};

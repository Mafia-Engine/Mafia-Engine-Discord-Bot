import { CategoryChannel, CommandInteraction, TextChannel } from 'discord.js';
import { ConfessionalsRaw, ConfessionalsSchema, IndividualConfessional, updateChannelPermissions } from '../../database/Confessionals';
import { SlashCommand } from '../../structures/SlashCommand';

export const slashCommand: SlashCommand = {
	name: 'remove',
	description: '[HOST] Delete a player chat',
	commandData: [
		{
			name: 'channel',
			description: 'Remove a player based from their chat channel (will delete the channel)',
			type: 'CHANNEL',
			required: true,
		},
	],

	commandFunction: async (i: CommandInteraction) => {
		await i.deferReply().catch(console.log);
		const channel = i.channel as TextChannel;
		if (channel.name !== 'host-panel') return i.editReply('You cannot use this command outside of the dedicated host panel.').catch(console.log);

		const reqChannel = i.options.getChannel('channel', true);

		try {
			const fetchedConfessional = await ConfessionalsSchema.findOne({ hostPanelId: channel.parentId });
			if (!fetchedConfessional) return await i.editReply('Cannot find a stored player chats linked to this category.').catch(console.log);

			let deleteFromIndex: number | null = null;
			if (fetchedConfessional.confessionals) {
				fetchedConfessional.confessionals.forEach((val: IndividualConfessional, index: number) => {
					if (val.channelId === reqChannel.id) deleteFromIndex = index;
				});

				if (deleteFromIndex) fetchedConfessional.confessionals.splice(deleteFromIndex, 1);
			}

			await fetchedConfessional.save();
		} catch (err) {
			console.log(err);
			await i.editReply(`An unexpected error has occurred.`).catch(console.log);
		}
	},
};

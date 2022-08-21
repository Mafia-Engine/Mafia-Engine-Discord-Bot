import { CategoryChannel, CommandInteraction, Guild, TextChannel } from 'discord.js';
import { ConfessionalsRaw, ConfessionalsSchema, IndividualConfessional, updateChannelPermissions } from '../../database/Confessionals';
import { SlashCommand } from '../../structures/SlashCommand';

export const slashCommand: SlashCommand = {
	name: 'managehost',
	description: '[HOST] Manage a host/co-host',
	commandData: [
		{
			name: 'user',
			description: 'User of which you want to manage their host privelages',
			type: 'USER',
			required: true,
		},
		{
			name: 'type',
			description: 'What do you want to do with them, defaults to adding them',
			type: 'STRING',
			choices: [
				{ name: 'Add', value: 'Add' },
				{ name: 'Remove', value: 'Remove' },
			],
		},
	],

	commandFunction: async (i: CommandInteraction) => {
		await i.deferReply().catch(console.log);
		const channel = i.channel as TextChannel;
		if (channel.name !== 'host-panel') return i.editReply('You cannot use this command outside of the dedicated host panel.').catch(console.log);

		const newHost = i.options.getUser('user', true);
		const actionType = i.options.getString('type') || 'Add';

		try {
			const fetchedConfessional = await ConfessionalsSchema.findOne({ hostPanelId: channel.parentId });
			if (!fetchedConfessional) return await i.editReply('Cannot find a stored player chats linked to this category.').catch(console.log);

			switch (actionType) {
				case 'Add':
					fetchedConfessional.hostIds.push(newHost.id);
					await fetchedConfessional.save();
					await i.editReply(`<@${newHost.id}> added as a host.`);
					break;
				case 'Remove':
					fetchedConfessional.hostIds = fetchedConfessional.hostIds.filter((host: string) => host != newHost.id);
					await fetchedConfessional.save();
					await i.editReply(`<@${newHost.id}> (${newHost.username}) removed as a host.`);
					break;
				default:
					break;
			}

			await updateChannelPermissions(channel, fetchedConfessional);
			const confessionalList = fetchedConfessional.confessionals || [];
			await confessionalList.forEach(async (conf: IndividualConfessional) => {
				const confChannel = channel.guild.channels.cache.get(conf.channelId) as TextChannel;
				await updateChannelPermissions(confChannel, fetchedConfessional);
			});
		} catch (err) {
			console.log(err);
			await i.editReply(`An unexpected error has occurred.`).catch(console.log);
		}
	},
};

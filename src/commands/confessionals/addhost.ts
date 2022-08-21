import { CategoryChannel, CommandInteraction, Guild, TextChannel } from 'discord.js';
import { ConfessionalsRaw, ConfessionalsSchema, IndividualConfessional, updateChannelPermissions } from '../../database/Confessionals';
import { SlashCommand } from '../../structures/SlashCommand';

export const slashCommand: SlashCommand = {
	name: 'addhost',
	description: '[HOST] Add a new co-host to a game..',
	commandData: [
		{
			name: 'cohost',
			description: 'Co-host which you are adding',
			type: 'USER',
			required: true,
		},
	],

	commandFunction: async (i: CommandInteraction) => {
		await i.deferReply().catch(console.log);
		const channel = i.channel as TextChannel;
		if (channel.name !== 'host-panel') return i.editReply('You cannot use this command outside of the dedicated host panel.').catch(console.log);

		const newHost = i.options.getUser('cohost', true);

		try {
			const fetchedConfessional = await ConfessionalsSchema.findOne({ hostPanelId: channel.parentId });
			if (!fetchedConfessional) return await i.editReply('Cannot find a stored player chats linked to this category.').catch(console.log);
			fetchedConfessional.hostIds.push(newHost.id);

			await fetchedConfessional.save();

			await i.editReply(`<@${newHost.id}> added as a co-host.`);

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

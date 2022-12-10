import { Constants, MessageEmbed, TextChannel } from 'discord.js';
import { SlashCommand } from '../../systems/SlashCommand';

export default new SlashCommand('lockchannel', 'Locks channel')
	.setServerTypes(['game', 'confessionals'])
	.addOption({
		name: 'role',
		description: 'Role to lock it from',
		type: 'ROLE',
		required: true,
	})
	.addOption({
		name: 'channel',
		description: 'Channel to lock, defaults to current',
		type: 'CHANNEL',
	})
	.setSlashFunction(async (i) => {
		const channel = (i.options.getChannel('channel') ?? i.channel) as TextChannel;
		const role = i.options.getRole('role', true);

		channel.permissionOverwrites.create(role.id, { SEND_MESSAGES: false });
	})
	.publish();

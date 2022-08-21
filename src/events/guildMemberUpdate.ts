import { GuildMember } from 'discord.js';
import { config } from '../config';

const { coreServerId, privateChatServerID } = config;

export default function GuildMemberUpdate(oldUser: GuildMember, newUser: GuildMember) {
	try {
		const guild = oldUser.guild;
		if (!guild) return;

		const client = guild.client;
		if (!client) return;

		let privateChannelServer = client.guilds.cache.get(privateChatServerID);
		let coreServer = client.guilds.cache.get(coreServerId);

		if (!coreServer || !privateChannelServer) return console.log('Is not connected in the required multiple servers.');

		const coreUser = coreServer.members.cache.get(oldUser.id);
		const privUser = privateChannelServer.members.cache.get(oldUser.id);

		if (!coreUser || !privUser) return console.log('Does not exist in both servers');

		let canChangeNicks = privateChannelServer.me?.permissions.has('MANAGE_NICKNAMES');
		if (!canChangeNicks) return console.log('Cannot change nickname');
		if (coreUser.nickname && privateChannelServer.ownerId != privUser.id) privUser.setNickname(coreUser.nickname);
	} catch (err) {
		console.log(err);
	}
}

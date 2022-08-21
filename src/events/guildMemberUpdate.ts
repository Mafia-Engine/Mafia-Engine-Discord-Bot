import { GuildMember } from 'discord.js';
import { config } from '../config';

const { coreServerId, privateChatServerID } = config;

export default function GuildMemberUpdate(oldUser: GuildMember, newUser: GuildMember) {
	const guild = newUser.guild;
	const client = guild.client;

	let privateChannelServer = client.guilds.cache.get(privateChatServerID);
	let coreServer = client.guilds.cache.get(coreServerId);

	if (!coreServer || !privateChannelServer) return;

	let coreUser = coreServer.members.cache.get(newUser.id);
	let privateUser = privateChannelServer.members.cache.get(newUser.id);

	if (!coreUser || !privateUser) return;

	if (coreUser.nickname) privateUser.setNickname(coreUser.nickname);
}

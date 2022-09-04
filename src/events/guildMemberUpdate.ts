import { GuildMember } from 'discord.js';
import { config } from '../config';
import { User } from '@prisma/client';
import prisma from '../database';

const { coreServerId, privateChatServerID } = config;

export default async function GuildMemberUpdate(oldUser: GuildMember, newUser: GuildMember) {
	try {
		const guild = oldUser.guild;
		if (!guild) return;

		const client = guild.client;
		if (!client) return;

		let coreServer = client.guilds.cache.get(coreServerId);
		const coreUser = coreServer.members.cache.get(oldUser.id);

		let userID = oldUser.id || newUser.id;
		let newUsername = coreUser.nickname ?? coreUser.displayName ?? coreUser.user.username;
		const fetchedUser = await prisma.user.findFirst({
			where: {
				discordId: userID,
			},
		});
		if (!fetchedUser) {
			const newCitizen = await prisma.user.create({
				data: {
					discordId: userID,
					nickname: newUsername,
				},
			});
			return;
		}

		let privateChannelServer = client.guilds.cache.get(privateChatServerID);

		if (!coreServer || !privateChannelServer) return console.log('Is not connected in the required multiple servers.');
		const privUser = privateChannelServer.members.cache.get(oldUser.id);
		if (!coreUser || !privUser) return console.log('Does not exist in both servers');
		let canChangeNicks = privateChannelServer.me?.permissions.has('MANAGE_NICKNAMES');
		if (!canChangeNicks) return console.log('Cannot change nickname');
		if (coreUser.nickname && privateChannelServer.ownerId != privUser.id) privUser.setNickname(coreUser.nickname);
	} catch (err) {
		console.log(err);
	}
}

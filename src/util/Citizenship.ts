import { User } from '@prisma/client';
import { GuildMember } from 'discord.js';
import prisma from '../database';

type CreateCitizenResponse = {
	alreadyExists?: Boolean;
	success: Boolean;
	user?: User;
};
export async function createCitizenship(user: GuildMember, knownUnique?: boolean): Promise<CreateCitizenResponse> {
	const discordId = user.id;
	const nickname = user.displayName;
	const avatarURL = user.displayAvatarURL();
	const displayColor = user.displayColor;

	const fetchCitizen = await prisma.user.findUnique({
		where: {
			discordId,
		},
	});
	if (fetchCitizen) return { alreadyExists: true, success: false };
	const newCitizen = await prisma.user.create({
		data: {
			discordId,
			nickname,
			avatarURL,
			displayColor,
		},
	});
	return {
		success: true,
		user: newCitizen,
	};
}

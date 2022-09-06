import { CommandInteraction, MessageEmbed, Constants, Guild, MessageActionRow, MessageButton, GuildMember } from 'discord.js';
import { SlashCommand } from '../../structures/SlashCommand';
import prisma from '../../database';
import { User } from '@prisma/client';
import { createCitizenship } from '../../util/Citizenship';

export const slashCommand: SlashCommand = {
	name: 'citizenship',
	description: 'View the citizenship status of a user.',
	commandData: [
		{
			name: 'user',
			description: 'User of which you wish to fetch the citizenship card for. Defaults to yourself',
			type: 'USER',
			required: false,
		},
	],

	commandFunction: async (i: CommandInteraction) => {
		await i.deferReply({}).catch(console.log);
		try {
			let user = i.options.getUser('user');
			let discordId = i.user.id;
			if (user) discordId = user.id;

			let citizenship = await prisma.user.findUnique({ where: { discordId } });
			if (!citizenship) {
				const member = await i.guild.members.fetch(discordId);
				let newCit = await createCitizenship(member);
				citizenship = newCit.user;
			}
			if (!citizenship) throw Error('Failed to create User');

			const citizenshipCard = generateCitizenshipCard(citizenship);
			await i.editReply({ embeds: [citizenshipCard] });
		} catch (err) {
			console.log(err);
			await i.editReply('An error has occurred');
		}
	},
};

function generateCitizenshipCard({ nickname, createdAt, avatarURL, displayColor, signupBan }: User) {
	const messageEmbed = new MessageEmbed()
		.setTitle(nickname)
		.setDescription(`Became Citizen - <t:${Math.floor(createdAt.getTime() / 1000)}>`)
		.setColor(displayColor || Constants.Colors.BLURPLE);

	if (avatarURL) messageEmbed.setThumbnail(avatarURL);
	if (signupBan) messageEmbed.addField('Status List', 'Signup Banned', true);

	return messageEmbed;
}

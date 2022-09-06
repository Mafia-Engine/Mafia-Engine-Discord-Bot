import { CommandInteraction, MessageEmbed, Constants, Guild, MessageActionRow, MessageButton, GuildMember } from 'discord.js';
import { SlashCommand } from '../../structures/SlashCommand';
import prisma from '../../database';
import { User } from '@prisma/client';
import { createCitizenship } from '../../util/Citizenship';

export const slashCommand: SlashCommand = {
	name: 'signupban',
	description: 'Set the signup ban status of a member.',
	commandData: [
		{
			name: 'user',
			description: 'User of which you wish to fetch the citizenship card for. Defaults to yourself',
			type: 'USER',
			required: true,
		},
		{
			name: 'banned',
			description: 'Would you like to ban or remove the ban?',
			type: 'STRING',
			choices: [
				{
					name: 'Add',
					value: 'add',
				},
				{
					name: 'Remove',
					value: 'remove',
				},
			],
			required: true,
		},
	],

	commandFunction: async (i: CommandInteraction) => {
		await i.deferReply({}).catch(console.log);
		if (!i.memberPermissions || !i.memberPermissions.has('ADMINISTRATOR'))
			return i
				.reply({
					content: 'You need to be an Administrator or higher to access this command.',
					ephemeral: true,
				})
				.catch(console.log);

		const user = i.options.getUser('user', true);
		const banType = i.options.getString('banned', true);
		let isBanned = banType === 'add';

		try {
			let discordId = user.id;
			let citizenship = await prisma.user.findUnique({ where: { discordId } });
			if (!citizenship) {
				const member = await i.guild.members.fetch(discordId);
				let newCit = await createCitizenship(member);
				citizenship = newCit.user;
			}
			if (!citizenship) throw Error('Failed to create user in signup ban');

			const update = await prisma.user.update({
				where: { discordId },
				data: {
					signupBan: isBanned,
				},
			});

			let allSignupBans = await prisma.user.findMany({ where: { signupBan: true } });

			let signupBanList = allSignupBans.map((v) => {
				return `<@${v.discordId}> - ${v.nickname}`;
			});

			const replyEmbed = new MessageEmbed()
				.setTitle('Signup Bans')
				.setDescription(`Changed signup ban status for ${update.nickname}`)
				.setFields([{ name: 'Current Bans', value: signupBanList.length !== 0 ? signupBanList.join('\n') : 'None' }])
				.setColor(Constants.Colors.BLURPLE);

			await i.editReply({ embeds: [replyEmbed] });
		} catch (err) {
			console.log(err);
			await i.editReply('An error has occurred');
		}
	},
};

function generateCitizenshipCard({ nickname, createdAt, avatarURL, displayColor }: User) {
	const messageEmbed = new MessageEmbed()
		.setTitle(nickname)
		.setDescription(`Became Citizen - <t:${Math.floor(createdAt.getTime() / 1000)}>`)
		.setColor(displayColor || Constants.Colors.BLURPLE);
	if (avatarURL) messageEmbed.setThumbnail(avatarURL);

	return messageEmbed;
}

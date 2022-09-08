import { CommandInteraction, MessageAttachment } from 'discord.js';
import { SlashCommand } from '../../structures/SlashCommand';
import prisma from '../../database';
import { User } from '@prisma/client';
import { createCitizenship } from '../../util/Citizenship';
import { citizenshipCard } from '../../util/SVGTemplates';
import https from 'https';
import sharp from 'sharp';

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

			let card = await generateCitizenshipCard(citizenship);
			let files = [new MessageAttachment(card, 'citizen.png')];
			await i.editReply({ files });
		} catch (err) {
			console.log(err);
			await i.editReply('An error has occurred');
		}
	},
};

export async function generateCitizenshipCard({ nickname, createdAt, avatarURL, displayColor, signupBan }: User) {
	if (!avatarURL.endsWith('.png')) return null;
	let buffer = await new Promise((resolve, _reject) => {
		https.get(avatarURL).on('response', function (r) {
			var buffers = [];
			r.on('data', function (data) {
				buffers.push(data);
			}).on('end', function () {
				resolve(`data:${r.headers['content-type']};base64,${Buffer.concat(buffers).toString('base64')}`);
			});
		});
	});
	let svgData = citizenshipCard({ username: nickname, title: 'Citizen', avatarUrl: (buffer as string) ?? avatarURL });
	let svgBuffer = await sharp(Buffer.from(svgData)).toFormat('png').toBuffer();
	return svgBuffer;
}

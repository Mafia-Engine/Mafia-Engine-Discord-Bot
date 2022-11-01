import { CommandInteraction, MessageAttachment } from 'discord.js';
import { SlashCommand } from '../../structures/SlashCommand';
// import prisma from '../../database';
import { User } from '@prisma/client';
import { createCitizenship } from '../../util/Citizenship';
import { citizenshipCard } from '../../util/svgUtils';
import https from 'https';
import sharp from 'sharp';
import axios from 'axios';

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
		return i.reply({ ephemeral: true, content: 'Please come back later' });
		// await i.deferReply({}).catch(console.log);
		// try {
		// 	let user = i.options.getUser('user');
		// 	let discordId = i.user.id;
		// 	if (user) discordId = user.id;

		// 	let citizenship = await prisma.user.findUnique({ where: { discordId } });
		// 	if (!citizenship) {
		// 		const member = await i.guild.members.fetch(discordId);
		// 		let newCit = await createCitizenship(member);
		// 		citizenship = newCit.user;
		// 	}
		// 	if (!citizenship) throw Error('Failed to create User');

		// 	let card = await generateCitizenshipCard(citizenship);
		// 	let files = [new MessageAttachment(card, 'citizen.png')];
		// 	await i.editReply({ files });
		// } catch (err) {
		// 	console.log(err);
		// 	await i.editReply('An error has occurred');
		// }
	},
};

export async function generateCitizenshipCard({ nickname, avatarURL }: User) {
	if (!avatarURL.endsWith('.png')) return null;
	const avatarResponse = await axios.get(avatarURL, { responseType: 'arraybuffer' });
	let avatarBuffer = `data:image/png;base64,${Buffer.from(avatarResponse.data, 'binary').toString('base64')}`;
	let svgData = citizenshipCard({ username: nickname, title: 'Citizen', avatar: avatarBuffer ?? avatarURL });
	let svgBuffer = await sharp(Buffer.from(svgData)).toFormat('png').toBuffer();
	return svgBuffer;
}

import { ArchivedMessage } from '@prisma/client';
import { Constants, Message, MessageActionRow, MessageButton, MessageEmbed, Modal, TextChannel, TextInputComponent } from 'discord.js';
import { prisma } from '../..';
import { SlashCommand } from '../../systems/SlashCommand';
import { interactionError } from '../../util/ErrorHandler';

function createProgressEmbed(channel: TextChannel, fetchedMessages: Map<string, Message> | null, archived: boolean | null) {
	const embed = new MessageEmbed();
	embed.setColor(Constants.Colors.WHITE);
	embed.setTitle('Archive Progress');
	embed.addField('Channel Archiving', `${channel.name} <#${channel.id}>`);
	if (fetchedMessages) embed.addField('Messages Fetched', fetchedMessages.size.toString());
	if (archived) {
		embed.addField('Total Messages Archived', '0');
		embed.setThumbnail('https://cdn3.emoji.gg/emojis/5508-imdone.png');
	}
	if (!archived) embed.setThumbnail('https://media.discordapp.net/attachments/980488547284951040/1048907474662596608/output-onlinegiftools.gif');

	return embed;
}

async function archiveMessage(msg: Message) {
	let count = 0;
	try {
		const reference = msg.reference;
		const channel = msg.channel as TextChannel;
		let referenceMsg: Message | undefined = undefined;
		if (reference) {
			const referenceId = reference.messageId;
			referenceMsg = await msg.channel.messages.fetch(referenceId);
			const otherArchive = await archiveMessage(referenceMsg);
			count += otherArchive.count;
		}

		const alreadyExists = await prisma.archivedMessage.findUnique({ where: { discordMessageId: msg.id } });
		if (alreadyExists) return { archived: alreadyExists, count, alreadyExists: true };

		const archivedMessageData = {
			authorDiscordId: msg.author.id,
			content: msg.content,
			createdAt: msg.createdAt,
			discordMessageId: msg.id,
			isPinned: msg.pinned,
			channel: {
				connectOrCreate: {
					where: { discordChannelId: msg.channel.id },
					create: {
						discordChannelId: msg.channel.id,
						title: channel.name,
					},
				},
			},
			repliedTo: undefined,
		};

		if (referenceMsg)
			archivedMessageData.repliedTo = {
				connect: {
					discordMessageId: referenceMsg.id,
				},
			};

		const archivedMessage = await prisma.archivedMessage.create({
			data: archivedMessageData,
		});

		return { archived: archivedMessage, count: count + 1 };
	} catch (err) {
		console.log(err);
		return { error: true, count };
	}
}

export default new SlashCommand('archive', 'Archive a channel')
	.setServerTypes(['game', 'confessionals'])
	.addOption({
		name: 'channel',
		description: 'Channel you wish to archive',
		type: 'CHANNEL',
		required: true,
	})
	.setSlashFunction(async (i) => {
		await i.reply('Starting archive.');
		try {
			const channel = i.options.getChannel('channel', true) as TextChannel;
			const messagesToArchive = new Map<string, Message>();
			// Create message pointer
			let message = await channel.messages.fetch({ limit: 1 }).then((messagePage) => (messagePage.size === 1 ? messagePage.at(0) : null));

			let totalCount = 0;

			let whileIndex = 0;

			while (message) {
				whileIndex += 1;
				const messages = await channel.messages.fetch({ limit: 100, before: message.id });
				for (let i = 0; i < messages.size; i++) {
					const { archived, count, error, alreadyExists } = await archiveMessage(messages.at(i));
					totalCount += count;
					console.log(whileIndex, i, totalCount, error, alreadyExists ? 'REPEATED' : 'CREATED');
				}
				message = 0 < messages.size ? messages.at(messages.size - 1) : null;
				await i.editReply({ embeds: [createProgressEmbed(channel, messagesToArchive, null)] });
			}

			console.log('TOTAL:', totalCount);

			await i.editReply({ embeds: [createProgressEmbed(channel, messagesToArchive, true)] });
		} catch (err) {
			console.log(err);
			const error = await interactionError(err);
			if (err)
				await i.editReply({
					content: `Error occurred with ID of ${error}`,
				});
			else await i.editReply('Error occurred with no response ID');
		}
	})
	.publish();

import { Constants, MessageActionRow, MessageButton, MessageEmbed, Modal, TextChannel, TextInputComponent } from 'discord.js';
import { prisma } from '../..';
import { SlashCommand } from '../../systems/SlashCommand';
import { interactionError } from '../../util/ErrorHandler';

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

			let archiveMessage = `Archiving ${channel.name}`;
			await i.editReply(archiveMessage);

			let messages = [];

			let threadMessageCountTotal = 0;
			let threadCount = 0;

			// Create message pointer
			let message = await channel.messages.fetch({ limit: 1 }).then((messagePage) => (messagePage.size === 1 ? messagePage.at(0) : null));
			while (message) {
				await channel.messages.fetch({ limit: 100, before: message.id }).then((messagePage) => {
					messagePage.forEach((msg) => {
						if (msg.hasThread) {
							const thread = msg.thread;
							threadCount += 1;
							threadMessageCountTotal += thread.messageCount;
						}
						messages.push(msg);
					});

					// Update our message pointer to be last message in page of messages
					message = 0 < messagePage.size ? messagePage.at(messagePage.size - 1) : null;
				});

				await i.editReply(`${archiveMessage}\nSo far: ${messages.length} messages, ${threadCount} threads with ${threadMessageCountTotal} total thread messages.\n${threadMessageCountTotal + messages.length}`);
			}

			let replies: string[] = [];
			replies.push(`Total normal messages: ${messages.length}`);
			replies.push(`${threadCount} threads with ${threadMessageCountTotal} messages combined`);
			replies.push(`${messages.length + threadMessageCountTotal} total messages.`);
			await i.editReply(replies.join('\n'));
		} catch (err) {
			const error = interactionError(err);
			if (err)
				await i.editReply({
					content: `Error occurred with ID of ${error}`,
				});
			else await i.editReply('Error occurred with no response ID');
		}
	})
	.publish();

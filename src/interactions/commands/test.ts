import { Constants, Message, MessageActionRow, MessageButton, MessageEmbed, Modal, TextChannel, TextInputComponent } from 'discord.js';
import { prisma } from '../..';
import { SlashCommand } from '../../systems/SlashCommand';

const amountOfUsers = 15;

const generateUserList = (amount: number) => {
	let list = [];
	for (let i = 0; i < amount; i++) {
		list.push({
			name: `user${i + 1}`,
			description: 'User',
			type: 'USER',
			required: false,
		});
	}
	return list;
};

export default new SlashCommand('prod', 'Check prod timers for a user in a channel.')
	.setServerTypes(['game'])
	.addOption({
		name: 'channel',
		description: 'Channel of which to check prods in',
		type: 'CHANNEL',
		required: true,
	})
	.addOption({
		name: 'requirement',
		description: 'Amount of posts needed (default 25)',
		type: 'INTEGER',
		required: false,
	})
	.addOption({
		name: 'hours',
		description: 'Hours to check back for (default 24)',
		type: 'INTEGER',
		required: false,
	})
	.addOption({
		name: 'reveal',
		description: 'Publicly reveal these prods',
		type: 'BOOLEAN',
		required: false,
	})
	.addOptions(generateUserList(amountOfUsers))

	.setSlashFunction(async (i) => {
		const channel = i.options.getChannel('channel', true) as TextChannel;
		const prodHours = i.options.getInteger('hours') ?? 24;
		const prodReq = i.options.getInteger('requirement') ?? 25;
		const reveal = i.options.getBoolean('reveal') ?? false;
		let checkProdsForAfter = new Date().getTime() - 3600000 * prodHours;

		await i.deferReply({ ephemeral: reveal });

		const prodChecks: Record<string, Message<boolean>[]> = {};
		let users: string[] = [];
		for (let index = 0; index < amountOfUsers; index++) {
			const newUser = i.options.getUser(`user${index + 1}`, false);
			if (newUser) {
				users.push(newUser.id);
				prodChecks[newUser.id] = [];
			}
		}
		let message = await channel.messages.fetch({ limit: 1 }).then((messagePage) => (messagePage.size === 1 ? messagePage.at(0) : null));
		while (message) {
			await channel.messages.fetch({ limit: 100, before: message.id }).then((messagePage) => {
				messagePage.forEach((msg) => {
					if (users.includes(msg.author.id)) {
						if (msg.createdTimestamp >= checkProdsForAfter) {
							prodChecks[msg.author.id].push(msg);
						}
					}
				});
				message = 0 < messagePage.size ? messagePage.at(messagePage.size - 1) : null;
			});
		}

		let prodMessage = '--- PRODS ---\n';
		for (const userID in prodChecks) {
			console.log(`checking ${userID}`);
			const list = prodChecks[userID];
			if (list.length < 25) prodMessage += `<@${userID}> has ${list.length}/${prodReq} messages.\n`;
		}

		i.editReply({ content: prodMessage.trim() });

		// const modal = new Modal().setTitle('New Role').setCustomId('killplayer');

		// const roleName = new TextInputComponent().setCustomId('roleName').setLabel('Role Name').setStyle(1).setPlaceholder('e.g. Jailor');

		// const reasonForDeath = new TextInputComponent().setCustomId('reasonForDeath').setLabel('What is the cause of death?').setStyle(1).setPlaceholder('e.g. killed by Mafia N2 / lynched D4');
		// const firstActionRow = new MessageActionRow<TextInputComponent>().addComponents(reasonForDeath);

		// modal.setComponents(firstActionRow);
		// await i.showModal(modal);

		// const channel = i.channel;

		// const embed = new MessageEmbed().setTitle('Host Panel - Game Name').addField('Signup Channel', '<#1039967004569907301>', true).addField('Signup Channel', '<#1039967004569907301>', true).addField('Signup Channel', '<#1039967004569907301>', true).setColor(Constants.Colors.BLURPLE);
		// const row = new MessageActionRow().addComponents([new MessageButton().setCustomId('start').setLabel('Start Game').setStyle('PRIMARY'), new MessageButton().setCustomId('lock').setLabel('Lock Signup').setStyle('SECONDARY'), new MessageButton().setCustomId('confessionals').setLabel('Open Player-Chats').setStyle('SECONDARY')]);

		// channel.send({ embeds: [embed], components: [row] });
		// const playerEmbed = new MessageEmbed().setTitle('Game Information').addField('Player Chats', '<#1022137516167528469>\n'.repeat(15).trim(), true).addField('Backups', '<@416757703516356628>\n'.repeat(4).trim(), true).addField('Spectators', '<@416757703516356628>\n'.repeat(2).trim(), true).setColor(Constants.Colors.BLURPLE);
		// const playerRow = new MessageActionRow().addComponents([new MessageButton().setCustomId('kill').setLabel('Kill').setStyle('DANGER'), new MessageButton().setCustomId('revive').setLabel('Revive').setStyle('SUCCESS'), new MessageButton().setCustomId('missing').setLabel('Missing').setStyle('PRIMARY'), new MessageButton().setCustomId('replace').setLabel('Replace').setStyle('SECONDARY'), new MessageButton().setURL('https://bit.ly/3TsvgX8').setLabel('Spreadsheet').setStyle('LINK')]);

		// channel.send({ embeds: [playerEmbed], components: [playerRow] });
		// // const playerEmbed = new MessageEmbed().setTitle('Manage Players').addField('Players', '<@416757703516356628>\n'.repeat(15).trim(), true).addField('Backups', '<@416757703516356628>\n'.repeat(4).trim(), true).addField('Spectators', '<@416757703516356628>\n'.repeat(2).trim(), true).setColor(Constants.Colors.BLURPLE);

		// // channel.send({ embeds: [playerEmbed], components: [playerRow] });

		// const replacementEmbed = new MessageEmbed().setTitle('Replacements Needed!').setDescription('@MA69Backups this game currently needs `2` replacements\nIf anybody is interested, press the button below').setColor(Constants.Colors.YELLOW);
		// const replacementButtons = new MessageActionRow().addComponents([new MessageButton().setCustomId('replacement').setLabel('I want to replace!').setEmoji('❤️').setStyle('SECONDARY')]);

		// channel.send({ embeds: [replacementEmbed], components: [replacementButtons] });

		// const replacementFoundEmbed = new MessageEmbed().setTitle('Replacement Found!').setDescription('<@135784580077715458> has expressed their interest in replacing!\nDo you wish to have them replace?').setColor(Constants.Colors.YELLOW);
		// const replacementFoundButtons = new MessageActionRow().addComponents([new MessageButton().setCustomId('accept').setLabel('Accept').setStyle('SUCCESS'), new MessageButton().setCustomId('reject').setLabel('Reject').setStyle('DANGER')]);
		// channel.send({ content: '<@416757703516356628>', embeds: [replacementFoundEmbed], components: [replacementFoundButtons] });
	})
	.publish();

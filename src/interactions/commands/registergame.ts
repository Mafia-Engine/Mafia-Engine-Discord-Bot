import { UserGroup } from '@prisma/client';
import { MessageEmbed, Constants, Guild } from 'discord.js';
import { prisma } from '../..';
import { ConfessionalsSchema } from '../../database/Confessionals';
import { SlashCommand } from '../../systems/SlashCommand';
const Colors = Constants.Colors;

export default new SlashCommand('registergame', 'Register a game through the bot, allowing use for all game resources for hosts.')
	.setServerTypes(['game'])
	.addOptions([
		{
			name: 'host',
			description: 'Main host, or one of the co-hosts.',
			type: 'USER',
			required: true,
		},
		{
			name: 'queue',
			description: 'Which queue is the game running in?',
			type: 'STRING',
			required: true,
			choices: [
				{ name: 'Main', value: 'ma' },
				{ name: 'Special', value: 'sp' },
				{ name: 'Newbie', value: 'ne' },
				{ name: 'Community', value: 'co' },
			],
		},
		{
			name: 'number',
			description: 'What is the queue number for the game.',
			type: 'INTEGER',
			required: true,
		},
		{
			name: 'lfg',
			description: 'ID of the LFG (found on bottom of embed)',
			type: 'STRING',
			required: true,
		},
	])
	.setSlashFunction(async (i) => {
		const o = i.options;
		const mainHost = o.getUser('host', true);
		const queue = o.getString('queue', true);
		const number = o.getInteger('number', true);
		const lfgId = o.getString('lfg', true);

		const gameTag = `${queue}${number}`;
		let e = new MessageEmbed();

		const lfg = await prisma.lookingForGroup.findUnique({
			where: {
				identifier: lfgId,
			},
			include: {
				userGroups: true,
			},
		});

		if (!lfg) {
			e.setTitle('Game Registration - Failure');
			e.setColor(Colors.RED);
			e.addField('Reason', `LFG cannot be found with the ID of \`${lfgId}\``);
			return i.reply({ embeds: [e] });
		}

		let playerUserGroup: UserGroup;
		lfg.userGroups.forEach((group) => {
			if (group.title == 'players') playerUserGroup = group;
		});
		if (!playerUserGroup) {
			e.setTitle('Game Registration - Failure');
			e.setColor(Colors.RED);
			e.addField('Reason', `LFG doesn't have the required user group "Players"`);
			return i.reply({ embeds: [e] });
		}

		const playerChatGuild = i.guild.client.guilds.cache.get('753231987589906483');

		const category = await playerChatGuild.channels.create(gameTag, { type: 'GUILD_CATEGORY' });
		if (!category) return await i.editReply('An error has occurred when attempting to create the host category').catch(console.log);
		category.permissionOverwrites.create(playerChatGuild.roles.everyone, { VIEW_CHANNEL: false });
		for (const host of [mainHost]) {
			category.permissionOverwrites.create(host, { VIEW_CHANNEL: true });
		}
		const hostPanel = await playerChatGuild.channels.create('host-panel', { type: 'GUILD_TEXT', parent: category.id });
		if (!hostPanel) return await i.editReply('An error has occurred when attempting to create the host panel').catch(console.log);

		const newGame = await prisma.game.create({
			data: {
				gameTag,
				hosts: [mainHost.id],
				title: gameTag,
				hostChannelId: hostPanel.id,
			},
		});

		for (let i = 0; i < playerUserGroup.users.length; i++) {
			const user = playerUserGroup.users[i];
			await prisma.gameSlot.create({
				data: {
					currentPlayer: user,
					game: {
						connect: {
							gameTag,
						},
					},
					isDead: false,
				},
			});
		}

		const newFetched = await prisma.game.findUnique({
			where: {
				gameTag,
			},
			include: {
				gameSlots: true,
			},
		});

		console.log(newFetched);

		let players = '';
		newFetched.gameSlots.forEach((e) => {
			players += `<@${e.currentPlayer}>\n`;
		});

		// 1. Create game on DB
		// 2. Create category on confessional server
		// 3. Create host-panel in new category.

		e.setTitle('Game Registration - Success');
		e.setColor(Colors.GREEN);
		e.addField('Reason', 'Development lol');
		e.addField('Details', `Host/s: <@${mainHost.id}>\nGame Tag: ${gameTag.toUpperCase()}`);
		if (players.length > 0) e.addField('Players', players);
		e.addField('Host Channel', `<#${newGame.hostChannelId}>`);

		i.reply({ embeds: [e] });
	})
	.publish();

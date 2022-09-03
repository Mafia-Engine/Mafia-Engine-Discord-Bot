import { ButtonInteraction, Client, CommandInteraction, GuildMember, Interaction, Message, MessageEmbed, SelectMenuInteraction, TextChannel } from 'discord.js';
import { ConfessionalsSchema, IndividualConfessional } from '../database/Confessionals';
import { LFGSchema, UserGroup } from '../database/LFG';
import { createEmbed, createButtons } from '../structures/LookingForGroup';
import { ServerList, SlashCommand } from '../structures/SlashCommand';

import { config } from '../config';

export default function interactionCreate(i: Interaction) {
	if (i.isCommand()) return onCommand(i as CommandInteraction);
	if (i.isButton()) return onButton(i as ButtonInteraction);
	if (i.isSelectMenu()) return onSelectMenu(i as SelectMenuInteraction);
}

async function onCommand(i: CommandInteraction) {
	if (!i.guildId) return i.reply({ ephemeral: true, content: 'Error has occurred fetching the server' });

	let listObj = ServerList[i.guildId];
	if (!listObj) return;

	const command: SlashCommand | undefined = listObj[i.commandName];
	if (command) command.commandFunction(i);
}

async function onButton(i: ButtonInteraction) {
	const client = i.guild?.client;

	if (i.customId.startsWith('lfg-button-')) {
		const button = i.customId.substring('lfg-button-'.length, i.customId.length);
		let message = i.message as Message;
		const embed: MessageEmbed = message.embeds[0] as MessageEmbed;
		if (!embed) return;
		try {
			const anError = async (id: number) => {
				return i.reply({ content: 'An error has occurred with ID of ' + id, ephemeral: true }).catch(console.log);
			};

			const ID = embed.footer?.text;
			if (!ID) return anError(1);
			const fetchedLFG = await LFGSchema.findOne({ identifier: ID });
			if (!fetchedLFG) return anError(2);

			const userGroups: Record<string, UserGroup> = {};
			fetchedLFG.userGroups.forEach((v: UserGroup) => (userGroups[v.title] = v));

			const requestedUserGroup = userGroups[button];
			let canJoin: boolean | null = false;
			if (!requestedUserGroup) {
				for (const groupName in userGroups) {
					const group = userGroups[groupName];
					if (group) group.users = group.users.filter((val) => val != i.user.id);
				}
			} else {
				if (requestedUserGroup.max) canJoin = requestedUserGroup.max > requestedUserGroup.users.length;
				else canJoin = true;
				if (!canJoin && canJoin !== null) return i.deferUpdate().catch(console.log); //i.reply({ content: 'Requested group cannot be joined. ', ephemeral: true });

				for (const groupName in userGroups) {
					const group = userGroups[groupName];
					if (group) {
						group.users = group.users.filter((val) => val != i.user.id);
						if (groupName === button) group.users.push(i.user.id);
					}
				}
			}

			fetchedLFG.userGroups = Object.values(userGroups);
			const saved = await fetchedLFG.save();

			const embeds = [createEmbed(saved)];
			const components = [createButtons(saved)];

			let showPrivateServerPrompt = false;

			// if (client) {
			// 	const privServer = client.guilds.cache.get(config.privateChatServerID);
			// 	if (privServer) {
			// 		let containsUser = privServer.members.cache.get(i.user.id);
			// 		showPrivateServerPrompt = !!containsUser;
			// 	}
			// }

			let updateValue = { embeds, components };

			if (!showPrivateServerPrompt) i.update(updateValue).catch(console.log);
			else {
				let rawMessage = i.message as Message;
				await rawMessage.edit(updateValue);
				i.reply({ ephemeral: true, content: `Hey <@${i.user.id}>,\nIt appears you are not in the player chat server. Please join via the following link https://discord.gg/4ygmH7b` });
			}
		} catch (err) {
			console.log(err);
			return i.reply({ content: 'An error has occurred with ID of ' + 0, ephemeral: true }).catch(console.log);
		}
	}

	if (i.customId.startsWith('vote-button-view-')) {
		const button = i.customId.substring('vote-button-view-'.length, i.customId.length);
		const message = i.message as Message;

		const anError = (id: number) => {
			return i.reply({ content: `<@${i.user.id}>, an error occurred when doing your request. [1]`, ephemeral: true });
		};

		const data: string[] = button.split('-');
		if (data.length == 0) return anError(1);

		const firstUser = i.guild?.members.cache.get(data[0] as any);
		const secondUser = i.guild?.members.cache.get(data[1] as any);

		if (!firstUser) return anError(2);

		let messageValue = null;
		if (!secondUser) messageValue = `${firstUser.displayName} has unvoted.`;
		else messageValue = `${firstUser.displayName} has voted ${secondUser.displayName}`;

		if (!null) return i.reply({ content: messageValue, ephemeral: true });
		return i.reply({ content: `<@${i.user.id}>, an error occurred when doing your request. [2]`, ephemeral: true });
	}

	if (i.customId === 'vote-count-request') {
		const greyLineSeperator = '\n--- --- --- --- ---\n';
		const divider = '\n»»-————-————-————-———-««\n';
		const lineSeperator = divider;
		const voteCount = `${'```'}diff\nMelancholy (dead) -> Lunex, EqsyLootz, QuackAttack, MIH, Saderen, Kon, Snowball, LilyBottom${lineSeperator}nNo-Lynch (1) -> Melancholy${lineSeperator}Not Voting (3) -> EqsyLootz, Quack, MIH${'```'}`;

		i.reply({ content: voteCount, ephemeral: true });
	}
}
async function onSelectMenu(i: SelectMenuInteraction) {
	const channel = i.channel as TextChannel;
	const category = channel.parent;
	const guild = i.guild;

	await i.deferReply({ ephemeral: true });

	if (!category) return;
	if (!guild) return;

	if (i.customId === 'remove-players') {
		try {
			const fetchedConfessional = await ConfessionalsSchema.findOne({ hostPanelId: channel.parentId });
			if (!fetchedConfessional) return i.editReply('Confessional does not exist in the database');

			for (let index = 0; index < i.values.length; index++) {
				let user = guild.members.fetch(i.values[index] as any);
			}

			fetchedConfessional.confessionals.forEach((conf: IndividualConfessional) => {
				if (i.values.includes(conf.user)) {
					category.children.get(conf.channelId)?.delete();
				}
			});

			fetchedConfessional.confessionals = fetchedConfessional.confessionals.filter((v: IndividualConfessional) => {
				return !i.values.includes(v.user);
			});

			await fetchedConfessional.save();

			await i.editReply('Player chats deleted');
		} catch (err) {
			console.log(err);
			await i.editReply('Unexpected error has been found.');
		}
	} else if (i.customId === 'reaction-role') {
		let roles = i.values;
		let uniqueGroups: string[][] = [
			['805450614594732033', '805450429885448222', '805450534663225405'],
			['838681467194048542', '838681670378323968', '838681748946157568', '838682474082861096', '838682677116534804', '838682829743325205', '838683251387400213'],
			['805310412081201152', '805310422894247956', '805310103955308574', '650045547125932033', '807805445522849814', '650825346693988398', '805310651374764033', '649759732009271296', '807805468768337950', '805310653333241906', '807805331081003028', '649419215182495765', '666876652671991819', '740608542020468776'],
		];

		let totalUpdates = '';

		for (const role of roles) {
			try {
				const member = i.member as GuildMember;
				let hasRole = member.roles.cache.has(role);

				if (hasRole) await member.roles.remove(role);
				else {
					for (const group of uniqueGroups) {
						let inGroup = group.includes(role);
						if (inGroup) {
							for (const oldRole of group) {
								let hasOldRole = member.roles.cache.has(oldRole);
								if (hasOldRole) await member.roles.remove(oldRole);
							}
						}
					}
					await member.roles.add(role);
				}

				totalUpdates += `\n<@&${role}> ${hasRole ? 'Removed' : 'Added'}`;
			} catch (err) {
				console.log(err);
			}
		}

		i.editReply({ content: totalUpdates.trim() || 'Nothing Changed' });
	}
}

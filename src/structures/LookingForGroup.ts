import { EmbedFieldData, MessageActionRow, MessageButton, MessageEmbed, Constants } from 'discord.js';
import axios from 'axios';
import { LookingForGroup } from '.prisma/client';
import { UserGroup } from '@prisma/client';

export interface LFGQueryData {
	id?: string;
}

const getMentionList = (list: string[]): string => {
	let mentionList = '';
	for (const value of list) {
		mentionList += `<@${value}>\n`;
	}
	if (!mentionList) mentionList = 'N/A';
	return mentionList;
};

const capitaliseString = (str: string): string => {
	let fullString = '';
	for (const splitVal of str.split(' ')) {
		fullString += splitVal[0].toUpperCase() + splitVal.substring(1, splitVal.length + 1) + ' ';
	}
	return fullString;
};

export const createEmbed = (
	data: LookingForGroup & {
		userGroups: UserGroup[];
	}
) => {
	let fields: EmbedFieldData[] = [];
	console.log(data);
	for (const field of data.userGroups) {
		let userGroupField = getMentionList(field.users);

		const fullString = capitaliseString(field.title);
		let name = fullString.trim();
		if (!field.max) name += ` [${field.users.length}]`;
		if (field.max) name += ` [${field.users.length}/${field.max}]`;

		fields.push({
			name,
			value: userGroupField,
			inline: true,
		});
	}

	const embed = new MessageEmbed();
	embed.setTitle(data.name || 'Looking For Group');
	embed.setColor(Constants.Colors.BLURPLE);
	embed.setDescription(data.description || 'Click on the appropriate buttons to join a group.');
	embed.addFields(fields);
	embed.setFooter({
		text: data.identifier,
	});

	return embed;
};

export const createButtons = (
	data: LookingForGroup & {
		userGroups: UserGroup[];
	}
): MessageActionRow => {
	let buttons: MessageButton[] = [];
	for (const userGroup of data.userGroups) {
		const fullString = capitaliseString(userGroup.title);
		buttons.push(
			new MessageButton()
				.setCustomId(`lfg-button-${userGroup.title}`)
				.setLabel(fullString)
				.setStyle(buttons.length == 0 ? 'PRIMARY' : 'SECONDARY')
				.setDisabled(false)
		);
	}

	buttons.push(new MessageButton().setCustomId('lfg-button-leave').setLabel('Leave').setStyle('DANGER'));
	return new MessageActionRow().addComponents(buttons);
};

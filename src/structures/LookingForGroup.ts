import { EmbedFieldData, MessageActionRow, MessageButton, MessageEmbed, Constants } from "discord.js";
import axios from 'axios';
import { LFGRawData, LFGSchema, LookingForGroupData, UserGroup } from "../database/LFG";

export interface LFGQueryData {
    id?: string;
}

export const getLFGFromEmbed = (embed: MessageEmbed): LookingForGroupData | null => {
    const { title, description, fields, footer } = embed;
    const lfgData: LookingForGroupData = {
        identifier: 'test',
        userGroups: [],
        hosts: []
    }

    lfgData.name = title || undefined;
    lfgData.description = description || undefined;
    
    for (const field of fields) {
        const { name, value } = field;
        const userGroup: UserGroup = {
            title: name,
            users: []
        };

        if (value !== 'N/A') {
            let list = value.split(/(\s+)/);
            for (const listObject of list) {
                let val = listObject.substring(2, listObject.length - 1);

                if (val != '\n')
                userGroup.users.push(val);
                        }
        }

        if (userGroup.title == 'Hosts') lfgData.hosts = userGroup.users;
        else lfgData.userGroups.push(userGroup);
    }

    return lfgData;
}
export const getLFGData = async (id: string): Promise<LookingForGroupData> => { 
    try {
        const data = await LFGSchema.findOne({ id });
        if (!data) return Promise.reject('LFG Does not exist');
        return data;
    } catch (err) {
        return Promise.reject('API Error');
    }
}

const getMentionList = (list: string[]): string=> {
    let mentionList = '';
    for (const value of list) {
        mentionList += `<@${value}>\n`
    }
    if (!mentionList) mentionList = 'N/A';
    return mentionList;
}

const capitaliseString = (str: string): string => {
    let fullString = '';
    for (const splitVal of str.split(' ')) {
        fullString += splitVal[0].toUpperCase() + splitVal.substring(1, splitVal.length+1) + ' ';
    }
    return fullString;
}

export const createEmbed = (data: LookingForGroupData | LFGRawData) => {
    let fields: EmbedFieldData[] = [];
    for (const field of data.userGroups) {
        let userGroupField = getMentionList(field.users);

        const fullString = capitaliseString(field.title);
        let name = fullString.trim();
        if (!field.max) name += ` [${field.users.length}]`
        if (field.max) name += ` [${field.users.length}/${field.max}]`

        fields.push(
            {
                name,
                value: userGroupField,
                inline: true
            }
        )
    }

    const embed = new MessageEmbed();
    embed.setTitle(data.name || 'Looking For Group')
    embed.setColor(Constants.Colors.BLURPLE)
    embed.setDescription(data.description || 'Click on the appropriate buttons to join a group.')
    embed.addFields(fields)
    embed.setFooter({
        text: data.identifier
    })

    return embed;
}

export const createButtons = (data: LookingForGroupData): MessageActionRow=> {
    let buttons: MessageButton[] = [];
    for (const userGroup of data.userGroups) {
        const fullString = capitaliseString(userGroup.title);
        buttons.push(
            new MessageButton()
                .setCustomId(`lfg-button-${userGroup.title}`)
                .setLabel(fullString)
                .setStyle(buttons.length == 0 ? 'PRIMARY' : 'SECONDARY')
                .setDisabled(false)
        )
    }
    
    buttons.push(new MessageButton().setCustomId('lfg-button-leave').setLabel('Leave').setStyle('DANGER'))
    return new MessageActionRow().addComponents(buttons);
}
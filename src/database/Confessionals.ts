import { TextChannel } from 'discord.js';
import { Schema, model, FilterQuery, Document } from 'mongoose';

export interface IndividualConfessional {
    user: string;
    channelId: string;
}

export interface ConfessionalsRaw {
    gameTag: string;
    title?: string;
    hostIds: string[];
    specIds?: string[];
    hostPanelId: string;
    confessionals?: IndividualConfessional[];
}
export interface Confessionals extends ConfessionalsRaw, Document {}

export const ConfessionalsSchema = model('discord-mafia-confessionals', new Schema({
    gameTag: String,
    title: String,
    hostIds: [String],
    specIds: [String],
    hostPanelId: String,
    confessionals: [new Schema({
        user: String,
        channelId: String
    })]
}));

export const updateChannelPermissions = async (channel: TextChannel, database: Confessionals | undefined): Promise<boolean> => {
    if (!database && !channel.parent) return false;
    const db: Confessionals | null = database || await ConfessionalsSchema.findOne({ hostPanelId: channel.parent?.id});
    if (!db) return false;    

    const { hostIds, confessionals, specIds } = db;

    hostIds.forEach((host: string) => {
        channel.permissionOverwrites.create(host, { VIEW_CHANNEL: true, MANAGE_MESSAGES: true });
    })

    if (specIds) specIds.forEach((spec: string) => {
        channel.permissionOverwrites.create(spec, { VIEW_CHANNEL: true });
    })

    confessionals?.forEach(({ user, channelId }: IndividualConfessional) => {
        if (channel.id === channelId) channel.permissionOverwrites.create(user, { VIEW_CHANNEL: true, SEND_MESSAGES: true });
    })

    return true;

}
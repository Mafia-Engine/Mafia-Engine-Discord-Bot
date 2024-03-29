import { TextChannel } from 'discord.js';
import { Schema, model, FilterQuery, Document } from 'mongoose';

import { AsyncForEachTryCatch as AsyncForEach } from '../util/Array';

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

export const ConfessionalsSchema = model(
	'discord-mafia-confessionals',
	new Schema({
		gameTag: String,
		title: String,
		hostIds: [String],
		specIds: [String],
		hostPanelId: String,
		confessionals: [
			new Schema({
				user: String,
				channelId: String,
			}),
		],
	})
);

export const updateChannelPermissions = async (channel: TextChannel, database: Confessionals | undefined): Promise<boolean> => {
	if (!database && !channel.parent) return false;
	const db: Confessionals | null = database || (await ConfessionalsSchema.findOne({ hostPanelId: channel.parent?.id }));
	if (!db) return false;

	const { hostIds, confessionals, specIds } = db;
	const guild = channel.guild;

	console.log('Change Host Perms');
	await AsyncForEach<string>(hostIds, async (host) => {
		await channel.permissionOverwrites.create(host, { VIEW_CHANNEL: true, MANAGE_MESSAGES: true });
	});

	console.log('Change Spectator Perms');

	if (specIds) {
		console.log('Change Spectator Perms - Continued');

		await AsyncForEach<string>(specIds, async (spec) => {
			await channel.permissionOverwrites.create(spec, { VIEW_CHANNEL: true });
		});
	}

	console.log('Change Confessional Perms');
	if (confessionals) {
		console.log('Change Confessional Perms - Continued');

		await AsyncForEach<IndividualConfessional>(confessionals, async ({ user, channelId }) => {
			if (channel.id === channelId) await channel.permissionOverwrites.create(user, { VIEW_CHANNEL: true, SEND_MESSAGES: true });
		});
	}

	return true;
};

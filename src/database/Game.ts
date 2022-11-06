import { Schema, model, FilterQuery, Document } from 'mongoose';

export interface Game {
	gameChannel?: string;
	voteChannel?: string; // Must exist to use in-chat votes.
}

export interface GameRaw extends Game, Document {}

export const GameSchema = model(
	'discord-mafia-game',
	new Schema({
		gameChannel: String,
		voteChannel: String,
	})
);

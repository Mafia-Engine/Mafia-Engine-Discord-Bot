import { Client, Interaction } from 'discord.js';

export type BaseEvent = (interaction: Interaction) => Promise<any>;

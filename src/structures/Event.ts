import { Client, Interaction } from "discord.js";

export interface BaseEvent {
    name: string;
    execute: (interaction: Interaction, client: Client) => Promise<any>;
}
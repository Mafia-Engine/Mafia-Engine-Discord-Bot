import { MessageEmbed } from 'discord.js';
import { SlashCommand } from '../systems/SlashCommand';

type Alignment = 'Town' | 'Mafia' | 'Coven' | 'Neutral';
type SubAlignment = MafiaSubAlign;
type MafiaSubAlign = 'Deception';

interface Role {
	name: string;
	alignment: Alignment;
	subalignment: SubAlignment;

	abilities: string;
	mechanics?: string[];

	wikiURL?: string;
	iconURL?: string;
}

const roles: Record<string, Role> = {
	vigilante: {
		name: 'Vigilante',
		abilities: 'Each night, you may choose to kill another player.',
		alignment: 'Mafia',
		subalignment: 'Deception',
		mechanics: ['This role is generally an X-shot.', 'If you kill a Town member, you will lose the ability to shoot.'],

		iconURL: 'https://wiki.mafiascum.net/images/thumb/a/a6/T-vigilante.png/380px-T-vigilante.png',
	},
};

export default new SlashCommand('roles', 'View information about assorted roles in Discord Mafia.')
	.setServerTypes(['game', 'confessionals'])
	.setSlashFunction(async (i) => {
		const role = roles['vigilante'];

		const embed = new MessageEmbed().setTitle(role.name).addField('Abilities', role.abilities).addField('Mechanics', role.mechanics.join('\n- ')).setURL(role.wikiURL).setThumbnail(role.iconURL);
		await i.reply({ embeds: [embed] });
	})
	.addOption({
		name: 'title',
		description: 'Title of the LFG',
		type: 'STRING',
		required: false,
	})
	.publish();

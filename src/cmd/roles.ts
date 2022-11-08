import { Constants, MessageEmbed } from 'discord.js';
import { SlashCommand } from '../systems/SlashCommand';

type Alignment = 'Town' | 'Mafia' | 'Coven' | 'Neutral';
type SubAlignment = MafiaSubAlign | TownSubAlign;
type MafiaSubAlign = 'Deception';
type TownSubAlign = 'Killing';

enum WinCondition {
	'Town' = 'You win when there are no longer any threats to the Town.',
	'Mafia' = 'You win when everyone who opposes the Mafia has died.',
	'Coven' = 'You win when everyone who opposes the Coven has died.',
}

interface Role {
	name: string;
	alignment: Alignment;
	subalignment: SubAlignment;

	flavour?: string;
	abilities: string;
	mechanics?: string[];

	wikiURL?: string;
	iconURL?: string;

	customWinCondition?: string;
}

const roles: Record<string, Role> = {
	// TK
	vigilante: {
		name: 'Vigilante',
		flavour: 'You are a militant cop who takes the law into your own hands.',
		abilities: 'Each night, you may shoot another player.',
		alignment: 'Town',
		subalignment: 'Killing',
		mechanics: ['You have 3 bullets.', 'If you kill a Town member, you will lose the ability to shoot.'],
		iconURL: 'https://static.wikia.nocookie.net/town-of-salem/images/a/a6/RoleIcon_Vigilante.png/revision/latest?cb=20200910205115',
		wikiURL: 'https://discord-mafia-role-cards.fandom.com/wiki/Vigilante',
	},

	// Mafia
	janitor: {
		name: 'Janitor',
		flavour: 'You are a janitor, hired by the mafia for your skilled method of cleaning crime scenes.',
		abilities: 'Each night, you may choose to clean a player. If they die that night, their role will not be revealed.',
		alignment: 'Mafia',
		subalignment: 'Deception',
		mechanics: ['You will know the exact role of any cleaned player'],
		iconURL: 'https://static.wikia.nocookie.net/town-of-salem/images/5/57/RoleIcon_Janitor.png/revision/latest?cb=20200910204245',
		wikiURL: 'https://discord-mafia-role-cards.fandom.com/wiki/Janitor',
	},
};

function allRoleOptions() {
	const result = [];
	Object.keys(roles).forEach((v) => {
		const firstLetter = v.charAt(0);
		const firstLetterCap = firstLetter.toUpperCase();
		const remainingLetters = v.slice(1);
		const capitalizedWord = firstLetterCap + remainingLetters;

		result.push({
			name: capitalizedWord,
			value: v,
		});
	});
	return result;
}

export default new SlashCommand('roles', 'View information about assorted roles in Discord Mafia.')
	.setServerTypes(['game', 'confessionals'])
	.setSlashFunction(async (i) => {
		const requestedRole = i.options.getString('role', true);
		const role = roles[requestedRole];

		if (!role) return i.reply({ content: 'An error has occurred', ephemeral: true });

		let color: number = Constants.Colors.GREEN;
		if (role.alignment == 'Mafia') color = Constants.Colors.RED;

		const abilityString = role.abilities;

		let mechanicsString = '';
		for (const mechanic of role.mechanics) {
			mechanicsString += `• ${mechanic}\n`;
		}

		let winCondition = role.customWinCondition ?? WinCondition[role.alignment];

		const embed = new MessageEmbed().setTitle(`${role.name} - ${role.alignment} ${role.subalignment}`).setDescription(`*${role.flavour}*`).addField('Abilities', abilityString.trim()).addField('Mechanics', mechanicsString.trim()).addField('Win Condition', winCondition).setURL(role.wikiURL).setThumbnail(role.iconURL).setColor(color);

		await i.reply({ embeds: [embed] });
	})
	.addOption({
		name: 'role',
		description: 'What role would you like to see?',
		type: 'STRING',
		required: true,
		choices: allRoleOptions(),
	})
	.publish();

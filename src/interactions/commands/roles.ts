import { SlashCommandMentionableOption } from '@discordjs/builders';
import { Constants, MessageEmbed, MessageMentions } from 'discord.js';
import e from 'express';
import { SlashCommand } from '../../systems/SlashCommand';

type Alignment = 'Town' | 'Mafia' | 'Coven' | 'Neutral';
type SubAlignment = MafiaSubAlign | TownSubAlign;
type MafiaSubAlign = 'Deception' | 'Head';
type TownSubAlign = 'Killing' | 'Investigative' | 'Protective' | 'Support' | 'Vanilla' | 'Power';

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
	veteran: {
		name: 'Veteran',
		flavour: 'You are a paranoid war hero who will shoot anyone who visits you.',
		abilities: 'Each night, you may decide to go on alert or not.',
		alignment: 'Town',
		subalignment: 'Killing',
		mechanics: ['You have 3 alerts.', 'Anybody that visits you while you are on alert will be attacked.'],
		iconURL: 'https://static.wikia.nocookie.net/town-of-salem/images/8/8a/RoleIcon_Veteran.png/revision/latest?cb=20200910205115',
		wikiURL: 'https://discord-mafia-role-cards.fandom.com/wiki/Veteran',
	},
	firebrand: {
		name: 'Firebrand',
		flavour: 'Flames burn ruthlessly and so does your drive to save this town.',
		abilities: 'Each night, you may douse a player or ignite all doused players.',
		alignment: 'Town',
		subalignment: 'Killing',
		mechanics: ['You can only ignite once.', 'Players killed by an ignite will appear as if an Arsonist did it.'],
		iconURL: 'https://static.wikia.nocookie.net/town-of-salem/images/4/4d/RoleIcon_Arsonist_1.png/revision/latest?cb=20200910205611',
		wikiURL: 'https://discord-mafia-role-cards.fandom.com/wiki/Firebrand',
	},

	// TI
	sheriff: {
		name: 'Sheriff',
		flavour: 'You are the Sheriff in this town and your role is to enforce the law.',
		abilities: 'Each night, you may choose to investigate someone.',
		alignment: 'Town',
		subalignment: 'Investigative',
		mechanics: ['You will know if the player is Innocent or Suspicious.', 'Detection immune roles will appear as Innocent', 'Framed players will appear as Suspicious'],
		iconURL: 'https://static.wikia.nocookie.net/town-of-salem/images/d/de/RoleIcon_Sheriff.png/revision/latest?cb=20200910204948',
		wikiURL: 'https://discord-mafia-role-cards.fandom.com/wiki/Sheriff',
	},
	lookout: {
		name: 'Lookout',
		flavour: 'You are an eagle-eyed observer, stealthily camping outside houses to gain information.',
		abilities: 'Each night, you may choose a player to watch over.',
		alignment: 'Town',
		subalignment: 'Investigative',
		mechanics: ['You will know who visits that player at night.'],
		iconURL: 'https://static.wikia.nocookie.net/town-of-salem/images/1/1d/RoleIcon_Lookout.png/revision/latest?cb=20200910204946',
		wikiURL: 'https://discord-mafia-role-cards.fandom.com/wiki/Lookout',
	},
	tracker: {
		name: 'Tracker',
		flavour: 'You are a guide working out of this town, so you have got a keen mind when it comes to keeping track of people.',
		abilities: 'Each night, you may choose to follow someone',
		alignment: 'Town',
		subalignment: 'Investigative',
		mechanics: ['You will know who that player visits on that night.'],
		iconURL: 'https://static.wikia.nocookie.net/town-of-salem/images/1/12/RoleIcon_Tracker.png/revision/latest?cb=20200910205850',
		wikiURL: 'https://discord-mafia-role-cards.fandom.com/wiki/Tracker',
	},

	// TP
	doctor: {
		name: 'Doctor',
		flavour: "You are this town's doctor, and have kept everybody healthy for years.",
		abilities: 'Each night, you may choose a player heal.',
		alignment: 'Town',
		subalignment: 'Protective',
		mechanics: ['You will prevent normal attacks from killing yout target.'],
		iconURL: 'https://static.wikia.nocookie.net/town-of-salem/images/0/07/RoleIcon_Doctor_1.png/revision/latest?cb=20200910204944',
		wikiURL: 'https://discord-mafia-role-cards.fandom.com/wiki/Doctor',
	},
	bodyguard: {
		name: 'Bodyguard',
		flavour: 'You are an ex-soldier who secretly makes a living by selling protection.',
		abilities: 'Each night, you may choose a player to protect.',
		alignment: 'Town',
		subalignment: 'Protective',
		mechanics: ['If your target is attacked, both you and the attacker die instead.', "If you successfully protect someone, you can't be saved from death.", 'Your counterattack pierces through all night immunities.', 'Once per game, you may use a bulletproof vest which gives you night immunity for that night.'],
		iconURL: 'https://static.wikia.nocookie.net/town-of-salem/images/1/1e/RoleIcon_Bodyguard.png/revision/latest?cb=20200910204944',
		wikiURL: 'https://discord-mafia-role-cards.fandom.com/wiki/Bodyguard',
	},
	marshal: {
		name: 'Marshal',
		flavour: '',
		abilities: 'Each night you may choose to follow a player, scaring one malicious person from targeting them.',
		alignment: 'Town',
		subalignment: 'Protective',
		mechanics: ['You will only be notified if you scare away something with killing intent.', 'Roles in order of getting blocked. Deceptive > Action Block/Redirecting > Killing', 'Should your target be visited by multiple people with malicious intent, only one will flee unless they have been scared by you in a prior night.', 'Roles that use charges will still consume them upon being frightened off.'],
		iconURL: 'https://static.wikia.nocookie.net/town-of-salem/images/7/78/RoleIcon_Crusader.png/revision/latest?cb=20200910205848',
		wikiURL: 'https://discord-mafia-role-cards.fandom.com/wiki/Marshal',
	},

	// TS
	escort: {
		name: 'Escort',
		flavour: "You are this town's escort, usually providing various pleasures in exchange for money. But, now that evil people are overrunning this town, you decide to use your skills to aid the town.",
		abilities: 'Each night, you may choose a player to roleblock. A roleblocked player will have all actions they attempted to use that night fail.',
		alignment: 'Town',
		subalignment: 'Support',
		mechanics: ['You are roleblock immune', 'If you roleblock a Serial Killer they will instead kill you'],
		iconURL: 'https://static.wikia.nocookie.net/town-of-salem/images/4/4f/RoleIcon_Escort.png/revision/latest?cb=20200910204945',
		wikiURL: 'https://discord-mafia-role-cards.fandom.com/wiki/Escort',
	},
	transporter: {
		name: 'Transporter',
		flavour: 'Your job is to move people, no questions asked.',
		abilities: 'Each night you may transport two people. Anybody that targets one, will instead target the other.',
		alignment: 'Town',
		subalignment: 'Support',
		mechanics: ['Both targets will be told they were Transported.', 'You are roleblock and redirect immune', 'you cannot target yourself'],
		iconURL: 'https://static.wikia.nocookie.net/town-of-salem/images/b/bb/RoleIcon_Transporter.png/revision/latest?cb=20200910205114',
		wikiURL: 'https://discord-mafia-role-cards.fandom.com/wiki/Transporter',
	},
	traumapatient: {
		name: 'Trauma Patient',
		flavour: '',
		abilities: 'Each night you may choose to remember a non-unique, non-killing Town role.',
		alignment: 'Town',
		subalignment: 'Support',
		mechanics: ['Upon successfully remembering, you will become that role permanately.'],
		iconURL: 'https://static.wikia.nocookie.net/town-of-salem/images/2/22/RoleIcon_Amnesiac.png/revision/latest?cb=20200910205610',
		wikiURL: 'https://discord-mafia-role-cards.fandom.com/wiki/Trauma_Patient',
	},
	gravekeeper: {
		name: 'Gravekeeper',
		flavour: '',
		abilities: 'Each night, you may choose to reanimate the dead body of a Town member',
		alignment: 'Town',
		subalignment: 'Support',
		mechanics: ['You can use the reanimated body to perform their action on players of your choosing, you will receive any results they would', 'you can only reanimate a single body once', 'you cannot reanimate non-visiting, unique or town power roles'],
		iconURL: 'https://static.wikia.nocookie.net/town-of-salem/images/b/b2/RoleIcon_Retributionist.png/revision/latest?cb=20200910204948',
		wikiURL: 'https://discord-mafia-role-cards.fandom.com/wiki/Gravekeeper',
	},

	// TPower
	jailor: {
		name: 'Jailor',
		flavour: 'You are a prison guard who secretly detains suspects.',
		abilities: 'Each day, you may choose to jail a player.',
		alignment: 'Town',
		subalignment: 'Power',
		mechanics: ['At the start of every night, you will pull that player into jail.', 'You can communicate anonymously with the jailed player', 'Jailed players lose access to any factional chat, and cannot use their actions that night', 'All actions on a Jailed player will fail except for investigations.', 'Three times, you may choose to execute a jailed player. This will bypass all protections, if you execute a Town you lose access to future executions.', 'You cannot execute on night 1'],
		iconURL: 'https://static.wikia.nocookie.net/town-of-salem/images/f/f6/RoleIcon_Jailor.png/revision/latest?cb=20200910204946',
		wikiURL: 'https://discord-mafia-role-cards.fandom.com/wiki/Jailor',
	},
	mayor: {
		name: 'Mayor',
		flavour: 'You are the leader of the town.',
		abilities: 'Once per game during the day, you may choose to reveal as Mayor',
		alignment: 'Town',
		subalignment: 'Power',
		mechanics: ['Upon a reveal, it is publicly announced and confirmed that you are the Mayor.', 'When revealed, your vote will count as 3'],
		iconURL: 'https://static.wikia.nocookie.net/town-of-salem/images/4/4f/RoleIcon_Mayor.png/revision/latest?cb=20200910204947',
		wikiURL: 'https://discord-mafia-role-cards.fandom.com/wiki/Mayor',
	},

	// MAFIA HEAD
	godfather: {
		name: 'Godfather',
		flavour: 'You are the leader of organized crime.',
		abilities: 'When you are performing the factional kill, you may choose to add a buff to the kill for that night.',
		alignment: 'Mafia',
		subalignment: 'Head',
		mechanics: ['BUFF: Ninja - Hide any trace of the kill to all investgative roles', 'BUFF: Strongman - Your kill will pierce through all protective actions.', 'You are night immune and seen as Innocent to a Sheriff investigating you.'],
		iconURL: 'https://static.wikia.nocookie.net/town-of-salem/images/5/57/RoleIcon_Janitor.png/revision/latest?cb=20200910204245',
		wikiURL: 'https://discord-mafia-role-cards.fandom.com/wiki/Janitor',
	},
	caporegime: {
		name: 'Caporegime',
		flavour: 'A trusted and loyal lieutenant to the influential Godfather. Not being a fan of the killing part, you instead prefer to read and book keep the mafias earnings sending your goons to perform the will of the Mafia. For operations such as these you push aside your disgust and instead remind the goons just why you are in charge around here.',
		abilities: 'You may target a member in your team at night, retraining them into another Mafia role of your choosing. The player who is being retrained is roleblocked even through immunity if the retraining succeeds. However, should you be retraining yourself this will be ignored.',
		alignment: 'Mafia',
		subalignment: 'Deception',
		mechanics: ['You cannot retrain the night after a successful retrain.', 'You may not promote players into unique roles, even if they are already an unique role.'],
		iconURL: 'https://static.wikia.nocookie.net/town-of-salem/images/4/48/RoleIcon_Forger.png/revision/latest?cb=20200910204244',
		wikiURL: 'https://discord-mafia-role-cards.fandom.com/wiki/Caporegime',
	},
	underboss: {
		name: 'Underboss',
		flavour: 'You are a prison guard who secretly detains suspects.',
		abilities: 'Each day, you may choose to jail a player.',
		alignment: 'Mafia',
		subalignment: 'Head',
		mechanics: ['At the start of every night, you will pull that player into jail.', 'You can communicate anonymously with the jailed player', 'Jailed players lose access to any factional chat, and cannot use their actions that night', 'All actions on a Jailed player will fail except for investigations, protections and all actions from your Mafia.'],
		iconURL: 'https://static.wikia.nocookie.net/town-of-salem/images/f/f6/RoleIcon_Jailor.png/revision/latest?cb=20200910204946',
		wikiURL: 'https://discord-mafia-role-cards.fandom.com/wiki/Underboss',
	},

	// MAFIA SUPPORT
	consigliere: {
		name: 'Consigliere',
		flavour: "You were a successful investigator in your early days. However, you quickly learned that playing fair doesn't pay and when the Godfather approached you and asked for you to join them, your choice was easy.",
		abilities: 'Each night, you may investigate a player. You will learn their exact role',
		alignment: 'Mafia',
		subalignment: 'Support',
		mechanics: ['N/A'],
		iconURL: 'https://static.wikia.nocookie.net/town-of-salem/images/8/85/RoleIcon_Consigliere.png/revision/latest?cb=20200910204242',
		wikiURL: 'https://discord-mafia-role-cards.fandom.com/wiki/Consigliere',
	},
	consort: {
		name: 'Consort',
		flavour: "You were once an escort, giving away services to give your client's pleasure in exchange for money. You hated it, however, and felt used every night. Once the mafia came into town, you didn't hesitate one moment and managed to join them, offering to use your skills to distract townsfolk while each and every one of them was murdered.",
		abilities: 'Each night, you may choose a player to roleblock. A roleblocked player will have all actions they attempted to use that night fail.',
		alignment: 'Mafia',
		subalignment: 'Support',
		mechanics: ['You are roleblock immune', 'If you roleblock a Serial Killer they will instead kill you'],
		iconURL: 'https://static.wikia.nocookie.net/town-of-salem/images/4/4c/RoleIcon_Consort.png/revision/latest?cb=20200910204243',
		wikiURL: 'https://discord-mafia-role-cards.fandom.com/wiki/Consort',
	},
	agent: {
		name: 'Agent',
		flavour: 'You were a brilliant Spy in your early days, one of the best in the country. However, on one mission you were captured - by the Godfather. To your great surprise, he wanted to help you retire after all your years of service. The deal was simple. Use your talents to collect sensitive information from the townsfolk and he will rule to grant you whatever you want in this silly little town.',
		abilities: 'Each day, you may spy one a player to deduce if they can visit at night. Each night you also plant a bug, notifying you of who they visited if anybody and also what feedback they received.',
		alignment: 'Mafia',
		subalignment: 'Support',
		mechanics: ['N/A'],
		iconURL: 'https://static.wikia.nocookie.net/town-of-salem/images/c/cf/RoleIcon_Spy.png/revision/latest?cb=20200910205113',
		wikiURL: 'https://discord-mafia-role-cards.fandom.com/wiki/Agent',
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

		const embed = new MessageEmbed();
		embed.setTitle(`${role.name} - ${role.alignment} ${role.subalignment}`);
		embed.setDescription(`*${role.flavour}*`);
		embed.addField('Abilities', abilityString.trim());
		embed.addField('Mechanics', mechanicsString.trim());
		embed.setURL(role.wikiURL);
		embed.setThumbnail(role.iconURL);
		embed.setColor(color);

		if (role.alignment == 'Mafia') embed.addField('Mafia Abilities', '• Factional Communication: You may talk to the other members of the Mafia at all times.\n• Factional Kill: Each night either you or another member of the Mafia may perform the factional kill in order to attack another player.');
		embed.addField('Win Condition', winCondition);

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

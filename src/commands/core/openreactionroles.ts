import { CommandInteraction, Constants, MessageActionRow, MessageEmbed, MessageSelectMenu, MessageSelectOptionData, TextChannel } from 'discord.js';
import { SlashCommand } from '../../structures/SlashCommand';

export const slashCommand: SlashCommand = {
	name: 'reactionroles',
	description: '[STAFF] Send reaction role posts.',
	commandData: [],
	commandFunction: async (i: CommandInteraction) => {
		if (i.user.id !== '416757703516356628')
			return i
				.reply({
					content: 'You need to be an Administrator or higher to access this command.',
					ephemeral: true,
				})
				.catch(console.log);

		let list: ReactionRole[] = [];

		list.push(
			createReactionRole([
				'Game Queues',
				'Get notified for new playing opportunities in selected queues. Grab as many as you like!',
				[
					['Newcomer Queue', '974943573457899531', '🇳'],
					['Community Queue', '974943996050808852', '🇨'],
					['Main Queue', '837975333445173248', '🇲'],
					['Special Queue', '649937606598983680', '🇸'],
					['Turbo Queue', '1006985922111344682', '🇹'],
				],
				{ multiselect: true },
			])
		);

		list.push(
			createReactionRole([
				'Information',
				'Roles that will be pinged during special occasions or when we have an update for you.',
				[
					['Server Updates', '838698587843854336', '👀'],
					['Polls', '898172081546620978', '✉️'],
					['GIM Updates', '856970643752353835', '💡'],
				],
				{ multiselect: true },
			])
		);

		list.push(
			createReactionRole([
				'Channel Unlocks',
				'Receive access to additional channels or categories.',
				[
					['Plaza', '1006994001880174732', '💬'],
					['Archives', '803344027617198095', '📚'],
				],
				{ multiselect: true },
			])
		);

		list.push(
			createReactionRole([
				'Server Events',
				'Roles that will be pinged for events on the server.',
				[
					['General Events', '1006978512214835250', '🎉'],
					['Gamenights', '676120729149767703', '🥳'],
					['Movies / Shows', '1006981799936798770', '🎬'],
				],
				{ multiselect: true },
			])
		);

		list.push(
			createReactionRole([
				'Color Roles',
				'Change your name colour!',
				[
					['Mafioso', '805310412081201152', '<:role_color_mafioso:945093008024543302>'],
					['Arsonist', '805310422894247956', '<:role_color_arsonist:945094095347519488>'],
					['Survivor', '805310103955308574', '<:role_color_survivor:945096375392145468>'],
					['Amnesiac', '650045547125932033', '<:role_color_amnesiac:945092679300157440>'],
					['Safeguard', '807805445522849814', '<:role_color_safeguard:945096674433450075>'],
					['Serial Killer', '650825346693988398', '<:role_color_serial_killer:945094124992872508>'],
					['Witch', '805310651374764033', '<:role_color_witch:945092992505626664>'],
					['Jester', '649759732009271296', '<:role_color_jester:945092379721994290>'],
					['Juggernaut', '807805468768337950', '<:role_color_juggernaut:945096389707329587>'],
					['Werewolf', '805310653333241906', '<:role_color_werewolf:945094140268519444>'],
					['Guardian Angel', '807805331081003028', '<:role_color_guardian_angel:945096404571922452>'],
					['Executioner', '649419215182495765', '<:role_color_executioner:945094108551209000>'],
					['Vampire', '666876652671991819', '<:role_color_vampire:945093448841695252>'],
					['Pesitlence', '740608542020468776', '<:role_color_pestilence:945093357867241493>'],
				],
				{ multiselect: true },
			])
		);

		list.push(
			createReactionRole([
				'Pronouns',
				'Change your preferred pronoun!',
				[
					['They/Them', '805450614594732033', '🇹'],
					['He/Him', '805450429885448222', '🇭'],
					['She/Her', '805450534663225405', '🇸'],
				],
				{ multiselect: false },
			])
		);

		list.push(
			createReactionRole([
				'Location',
				'Change your current location!',
				[
					['North America', '838681467194048542', '🗽'],
					['Europe', '838681670378323968', '🇪🇺'],
					['Oceana', '838681748946157568', '🌊'],
					['Africa', '838682474082861096', '🌍'],
					['Asia', '838682677116534804', '🌏'],
					['South America', '838682829743325205', '🌎'],
					['Antarctica', '838683251387400213', '🧊'],
				],
				{ multiselect: false },
			])
		);

		const channel = i.channel as TextChannel;
		for (const data in list) {
			if (list[data]) {
				const { embed, actionRow } = list[data] as ReactionRole;
				await channel.send({ embeds: [embed], components: [actionRow] });
			}
		}

		i.reply({ content: 'Completed', ephemeral: true });
	},
};

interface ReactionRoleOptions {
	multiselect?: boolean;
}
type ReactionRoleData = [title: string, description: string, roles: RoleOption[], options: ReactionRoleOptions];
type RoleOption = [label: string, value: string, emoji: string | undefined];
interface ReactionRole {
	embed: MessageEmbed;
	actionRow: MessageActionRow;
}
function createReactionRole([title, description, roles, options]: ReactionRoleData): ReactionRole {
	const embed = new MessageEmbed().setTitle(title).setDescription(description).setColor(Constants.Colors.BLURPLE);
	let selectMenuOptions: MessageSelectOptionData[] = [];
	for (const [label, value, emoji] of roles) {
		selectMenuOptions.push({ label, value, emoji });
	}
	const select = new MessageSelectMenu().setOptions(selectMenuOptions).setCustomId('reaction-role');
	if (options) {
		if (options.multiselect) select.setMinValues(1);
	}
	const row = new MessageActionRow().setComponents(select);
	return { embed, actionRow: row };
}

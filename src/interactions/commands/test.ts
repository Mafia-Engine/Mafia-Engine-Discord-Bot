import { Constants, Message, MessageActionRow, MessageButton, MessageEmbed, Modal, TextChannel, TextInputComponent } from 'discord.js';
import { prisma } from '../..';
import { SlashCommand } from '../../systems/SlashCommand';

const amountOfUsers = 15;

const generateUserList = (amount: number) => {
	let list = [];
	for (let i = 0; i < amount; i++) {
		list.push({
			name: `user${i + 1}`,
			description: 'User',
			type: 'USER',
			required: false,
		});
	}
	return list;
};

export default new SlashCommand('test', 'Test')
	.setServerTypes(['game'])
	.setSlashFunction(async (i) => {
		await i.deferReply({ ephemeral: true });

		// i.channel.send(':)||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​|| _ _ _ _ _ _<@412634999020453891><@416757703516356628>');

		// const e = new MessageEmbed();

		// e.setTitle('NE20 - Ruleset');
		// e.setColor(Constants.Colors.WHITE);
		// e.setDescription('Day starts will be consistently start at <t:1669921200:t>.');
		// e.addField('__Time Details__', '**Day/Night Cycle:** 48h / 24h\n**Prod Check:** 25 posts per 24 hour period.');
		// e.addField('__Voting Details__', '**Majority:** Enabled\n**Plurality:** Enabled\n**Tied Votes:** First to Reach\n**No Votes:** Randomised');
		// // e.addField('__Mafia Details__', '**Day-Talk:** Enabled\n**Multi-tasking:** Disabled');

		// i.reply({ embeds: [e] });
	})
	.publish();

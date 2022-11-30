import { Constants, MessageEmbed } from 'discord.js';
import { SlashCommand } from '../../systems/SlashCommand';

export default new SlashCommand('fallacy', 'View information about select fallacies.')
	.setServerTypes(['game', 'confessionals'])
	.addOption({
		name: 'type',
		description: 'Which fallacy do you wish to know about?',
		type: 'STRING',
		required: true,
		choices: [
			{ name: 'Strawman', value: 'strawman' },
			{ name: 'Appeal to Emotion', value: 'appeal-to-emotion' },
			{ name: 'False Cause', value: 'false-cause' },
			{ name: "Gambler's Fallacy", value: 'the-gamblers-fallacy' },
			{ name: 'Bandwagon', value: 'bandwagon' },
			{ name: 'Appeal to Authority', value: 'appeal-to-authority' },
			{ name: 'The Fallacy Fallacy', value: 'the-fallacy-fallacy' },
			{ name: 'ad hominem', value: 'ad-hominem' },
			{ name: 'Slippery Slope', value: 'slippery-slope' },
			{ name: 'Composition/Division', value: 'composition-division' },
			{ name: 'No True Scotsman', value: 'no-true-scotsman' },
			{ name: 'Genetic', value: 'genetic' },
			{ name: 'tu quoque', value: 'tu-quoque' },
			{ name: 'Personal Incredulity', value: 'personal-incredulity' },
			{ name: 'Special Pleading', value: 'special-pleading' },
			{ name: 'Black or White', value: 'black-or-white' },
			{ name: 'Begging the Question', value: 'begging-the-question' },
			{ name: 'Appeal to Nature', value: 'appeal-to-nature' },
			{ name: 'Loaded Question', value: 'loaded-question' },
			{ name: 'Burden of Proof', value: 'burden-of-proof' },
			{ name: 'Ambiguity', value: 'ambiguity' },
			{ name: 'Anecdotal', value: 'anecdotal' },
			{ name: 'Cherry-picking', value: 'the-texas-sharpshooter' },
			{ name: 'Middle Ground', value: 'middle-ground' },
		],
	})
	.addOption({
		name: 'your-eyes-only',
		description: 'Want this result to only be seen by you?',
		type: 'BOOLEAN',
		required: false,
	})
	.setSlashFunction(async (i) => {
		try {
			const type = i.options.getString('type', true);
			const yourEyesOnly = i.options.getBoolean('your-eyes-only');
			const link = `https://yourlogicalfallacyis.com/${type}`;

			console.log(link);

			if (type === 'strawman') {
				const embed = new MessageEmbed().setTitle('Fallacy: Strawman').setDescription("**Misrepresenting someone's argument to make it easier to attack.**\nBy exaggerating, misrepresenting, or just completely fabricating someone's argument, it's much easier to present your own position as being reasonable, but this kind of dishonesty serves to undermine honest rational debate.").addField('Example', 'After Will said that we should put more money into health and education, Warren responded by saying that he was surprised that Will hates our country so much that he wants to leave it defenceless by cutting military spending.').setColor(Constants.Colors.BLURPLE).setURL(link);
				i.reply({ embeds: [embed], ephemeral: !!yourEyesOnly });
			} else {
				i.reply({ content: `https://yourlogicalfallacyis.com/${type}`, ephemeral: !!yourEyesOnly });
			}
		} catch (err) {
			console.log(err);

			await i.reply({ content: 'An error has occurred', ephemeral: true });
		}
	})
	.publish();

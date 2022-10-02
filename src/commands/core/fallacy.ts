import { CommandInteraction } from 'discord.js';
import { SlashCommand } from '../../structures/SlashCommand';

export const slashCommand: SlashCommand = {
	name: 'fallacy',
	description: 'List details about a logical fallacy.',
	commandData: [
		{
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
		},
		{
			name: 'your-eyes-only',
			description: 'Want this result to only be seen by you?',
			type: 'BOOLEAN',
			required: false,
		},
	],

	commandFunction: async (i: CommandInteraction) => {
		try {
			const type = i.options.getString('type', true);
			const yourEyesOnly = i.options.getBoolean('your-eyes-only');
			i.reply({ content: `https://yourlogicalfallacyis.com/${type}`, ephemeral: !!yourEyesOnly });
		} catch (err) {
			console.log(err);
		}
	},
};

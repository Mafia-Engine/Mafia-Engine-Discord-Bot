import Button from '../../systems/Buttons';

export default new Button('create-player-chats')
	.onClick(async (i, data) => {
		await i.reply({
			content: 'Registered',
			ephemeral: true,
		});
	})
	.publish();

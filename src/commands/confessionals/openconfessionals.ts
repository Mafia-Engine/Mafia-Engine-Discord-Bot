import { CommandInteraction} from "discord.js";
import { ConfessionalsRaw, ConfessionalsSchema, IndividualConfessional, updateChannelPermissions } from "../../database/Confessionals";
import { SlashCommand } from "../../structures/SlashCommand";

export const slashCommand: SlashCommand = {
    name: 'openconfessionals',
    description: '[STAFF] Open player confessionals for a game.',
    commandData: [
        {
            name: 'category',
            description: 'Category of which the game is being run in.',
            type: 'STRING',
            choices: [
                {
                    name: 'Main',
                    value: 'ma'
                },
                {
                    name: 'Special',
                    value: 'sp'
                },
                {
                    name: 'Newcomer',
                    value: 'ne'
                },
                {
                    name: 'Community',
                    value: 'co'
                }
            ],
            required: true
        },
        {
            name: 'number',
            description: 'Number ID of the game within the category',
            type: 'INTEGER',
            required: true
        },
        {
            name: 'host',
            description: 'Host for the game',
            type: 'USER',
            required: true
        },
        {
            name: 'cohost',
            description: 'Co-host for the game. If you require more hosts, add them via the /addhost command afterwards.',
            type: 'USER',
            required: false
        },
        {
            name: 'name',
            description: 'Name for the game, keep it as condensed as possible.',
            type: 'STRING',
            required: false
        },
    ],

    commandFunction: async (i: CommandInteraction) => {
        await i.deferReply();
        if (!i.memberPermissions || !i.memberPermissions.has('ADMINISTRATOR')) return i.editReply({
            content: 'You need to be an Administrator or higher to access this command.'
        });

        const guild = i.guild;
        if (!guild) return await i.editReply('An error has occurred with an ID of [1]')

        const category = i.options.getString('category', true);
        const number = i.options.getInteger('number', true)
        const mainHost = i.options.getUser('host', true);
        const cohost = i.options.getUser('cohost');
        const title = i.options.getString('name') || undefined;
        const gameTag = (category + number).toLowerCase();

        let hostIds = [mainHost.id];
        if (cohost) hostIds.push(cohost.id);

       

        try {
            const fetchConfessional = await ConfessionalsSchema.findOne({ gameTag });
            if (fetchConfessional) return await i.editReply({ content: `Confessional already exists with a gametag ${gameTag}`});

            const category = await guild.channels.create(gameTag, { type: 'GUILD_CATEGORY'});
            if (!category) return await i.editReply('An error has occurred when attempting to create the host category')
            category.permissionOverwrites.create(guild.roles.everyone, { VIEW_CHANNEL: false });
            hostIds.forEach((val) => {
                category.permissionOverwrites.create(val, { VIEW_CHANNEL: true });
            })

            const hostPanel = await guild.channels.create('host-panel', { type: 'GUILD_TEXT', parent: category.id });
            if (!hostPanel) return await i.editReply('An error has occurred when attempting to create the host panel');
            
            updateChannelPermissions(hostPanel, fetchConfessional);


            const confessionalData: ConfessionalsRaw = {
                title,
                gameTag,
                hostIds,
                hostPanelId: category.id
            }

            const newConfessional = new ConfessionalsSchema(confessionalData);
            await newConfessional.save();


            let fullHostString = '.';
            if (hostIds.length === 1) fullHostString = ` <@${hostIds[0]}>.`;
            else if (hostIds.length === 2) fullHostString = ` <@${hostIds[0]}> and <@${hostIds[1]}>.`;
            const hostPanelMessage = `Welcome${fullHostString}\n\nThis is where you will manage your players' confessionals.`

            hostPanel.send(hostPanelMessage)

            await i.editReply(`Confessionals have been created. Host panel: <#${hostPanel.id}>`);
        } catch (err) {
            console.log(err);
            await i.editReply({ content: 'An error has occurred with an ID of [0]'})
        }

    }
}
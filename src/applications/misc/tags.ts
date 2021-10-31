import Embed from '../../structures/Embed'
import { ApplicationCommandOptionType } from 'discord-api-types';
import { CommandInteraction, MessageActionRow, MessageSelectMenu, MessageSelectOptionData, Permissions } from 'discord.js';
import Client from "../../structures/Client";
import Command from "../../structures/Command";
import { ErrorType, PunishmentColor } from '../../types/ClientTypes';

export default class TagsCommand extends Command {
    constructor(client: Client) {
		super(client, {
			name: 'tag',
			description: 'Modify Tags',
			type: client.types.MISC,
		});
	}

    public async run(interaction: CommandInteraction): Promise<void> {
        const name = interaction.options.getString('name', true)
        const description = interaction.options.getString('content', false)

        switch(interaction.options.data[0].name) {
            case 'query':
                return void this.queryTag(interaction, name)
            case 'create':
                if(!(interaction.member.permissions as Readonly<Permissions>).has(Permissions.FLAGS.ADMINISTRATOR, true)) return void this.sendErrorMessage(interaction, { errorMessage: '401 Unauthorized', errorType: ErrorType.COMMAND_FAILURE })
                return void this.createTag(interaction, name, description);
            case 'edit':
                if(!(interaction.member.permissions as Readonly<Permissions>).has(Permissions.FLAGS.ADMINISTRATOR, true)) return void this.sendErrorMessage(interaction, { errorMessage: '401 Unauthorized', errorType: ErrorType.COMMAND_FAILURE })
                return void this.editTag(interaction, name, description)
            case 'delete':
                if(!(interaction.member.permissions as Readonly<Permissions>).has(Permissions.FLAGS.ADMINISTRATOR, true)) return void this.sendErrorMessage(interaction, { errorMessage: '401 Unauthorized', errorType: ErrorType.COMMAND_FAILURE })
                return void this.deleteTag(interaction, name)
        }
    }

    async queryTag(interaction: CommandInteraction, name: string): Promise<void> {
        const tag = await this.client.db.get(`tags:${interaction.guildId}:${name}`) ?? 'No Results Found';

        if(tag === 'No Results Found') {
            const keys = await this.client.db.keys(`tags:${interaction.guildId}:${name}*`);
			const keyObject: MessageSelectOptionData[] = [];

			for(const key of keys) {
				keyObject.push({ label: key.split(':')[2], value: key.split(':')[2] })
			}

            keyObject.length = 25
            
            const row = new MessageActionRow()
                                .addComponents(
                                    new MessageSelectMenu()
                                            .setCustomId('no-tag')
                                            .setPlaceholder('Make a Selection')
                                            .addOptions(keyObject)
                                            .setMaxValues(1)
                                )
            
            return void this.reply(interaction, { content: `Could not find a tag with name \`${name}\`. Select a similar result from the list to send it instead.`, components: [row], ephemeral: true })
        }
        
        return void this.reply(interaction, { content: this.client.utils.decrypt(tag), ephemeral: tag === 'No Results Found' ? true : false })
    }

    async createTag(interaction: CommandInteraction, name: string, description: string): Promise<void> {
        const createdTag = await this.client.db.get(`tags:${interaction.guildId}:${name}`);
        if(createdTag) return void this.sendErrorMessage(interaction, { errorMessage: 'Tag Already Exists', errorType: ErrorType.INVALID_ARGUMENT })
        await this.client.db.set(`tags:${interaction.guildId}:${name}`, this.client.utils.encrypt(description));

        const embed = new Embed(interaction)
                            .setColor(PunishmentColor.UNBAN)
                            .setTitle('Tag Created')
                            .setDescription(`Created tag \`${name}\` with content \`${description}\`\nPreview it with \`/tag query ${name}\`\n\n\`\`\`md\n# Due to discord limitations, please create a tag by creating a message with the format\n[tag name]\nTag Content\n# Right Click On Message > Apps > Create Tag\`\`\``)

        return void this.reply(interaction, { embeds: [embed], ephemeral: true })
    }

    async editTag(interaction: CommandInteraction, name: string, description: string): Promise<void> {
        const createdTag = await this.client.db.get(`tags:${interaction.guildId}:${name}`);
        if(!createdTag) return void this.sendErrorMessage(interaction, { errorMessage: 'No Tag Found', errorType: ErrorType.INVALID_ARGUMENT })
        await this.client.db.set(`tags:${interaction.guildId}:${name}`, JSON.stringify(this.client.utils.encrypt(description)));

        const embed = new Embed(interaction)
                            .setColor(PunishmentColor.UNBAN)
                            .setTitle('Tag Modified')
                            .setDescription(`Modified tag \`${name}\` with content \`${description}\`\nPreview it with \`/tag query ${name}\``)

        return void this.reply(interaction, { embeds: [embed], ephemeral: true })
    }

    async deleteTag(interaction: CommandInteraction, name: string): Promise<void> {
        const createdTag = await this.client.db.get(`tags:${interaction.guildId}:${name}`);
        if(!createdTag) return void this.sendErrorMessage(interaction, { errorMessage: 'No Tag Found', errorType: ErrorType.INVALID_ARGUMENT })
        await this.client.db.del(`tags:${interaction.guildId}:${name}`);

        const embed = new Embed(interaction)
                            .setColor(PunishmentColor.UNBAN)
                            .setTitle('Tag Deleted')
                            .setDescription(`Deleted tag \`${name}\``)

        return void this.reply(interaction, { embeds: [embed], ephemeral: true })
    }

    async generateSlashCommand(): Promise<Record<string, unknown>> {
        return {
            name: this.name,
            description: this.description,
            options: [{
                name: 'query',
                type: ApplicationCommandOptionType.Subcommand,
                description: 'Displays the specified tag',
                options: [{
                    name: 'name',
                    type: ApplicationCommandOptionType.String,
                    description: 'Tag Name',
                    required: true,
                    autocomplete: true
                }]
            },
            {
                name: 'create',
                type: ApplicationCommandOptionType.Subcommand,
                description: 'Creates a tag',
                options: [{
                    name: 'name',
                    type: ApplicationCommandOptionType.String,
                    description: 'Tag Name',
                    required: true,
                },
                {
                    name: 'content',
                    type: ApplicationCommandOptionType.String,
                    description: 'Tag Content',
                    required: true,
                }]
            },
            {
                name: 'edit',
                type: ApplicationCommandOptionType.Subcommand,
                description: 'Edits a tag',
                options: [{
                    name: 'name',
                    type: ApplicationCommandOptionType.String,
                    description: 'Tag Name',
                    required: true,
                    autocomplete: true
                },
                {
                    name: 'content',
                    type: ApplicationCommandOptionType.String,
                    description: 'Tag Content',
                    required: true,
                }]
            },
            {
                name: 'delete',
                type: ApplicationCommandOptionType.Subcommand,
                description: 'Deletes a tag',
                options: [{
                    name: 'name',
                    type: ApplicationCommandOptionType.String,
                    description: 'Tag Name',
                    required: true,
                    autocomplete: true
                }]
            }]
        }
    }
}
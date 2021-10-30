import Interaction from "../structures/Interaction";
import Client from "../structures/Client";
import { AutocompleteInteraction, ButtonInteraction, ContextMenuInteraction } from "discord.js";
import { ApplicationCommandType } from "discord-api-types";
import Embed from "../structures/Embed";
import { ErrorType, PunishmentColor } from "../types/ClientTypes";

class getTags extends Interaction {
	constructor(client: Client) {
		super(client, 'Create Tags');
	}

	async run(interaction: ButtonInteraction | AutocompleteInteraction | ContextMenuInteraction): Promise<void> {
        if(!interaction.isContextMenu()) return;
        const data = interaction.options.getMessage('message').content.match(/\[(.*?)\]/);

        if(data === null) return void this.sendErrorMessage(interaction, { errorMessage: 'Invalid Format (please encapsulate tag name with [] on the first line)', errorType: ErrorType.INVALID_ARGUMENT })

        return void this.createTag(interaction, data[1], interaction.options.getMessage('message').content.split('\n').slice(1).join('\n'))
	}

    async createTag(interaction: ContextMenuInteraction, name: string, description: string): Promise<void> {
        const createdTag = await this.client.db.get(`tags:${interaction.guildId}:${name}`);
        if(createdTag) return void this.sendErrorMessage(interaction, { errorMessage: 'Tag Already Exists', errorType: ErrorType.INVALID_ARGUMENT })
        await this.client.db.set(`tags:${interaction.guildId}:${name}`, JSON.stringify(description));

        const embed = new Embed(interaction)
                            .setColor(PunishmentColor.UNBAN)
                            .setTitle('Tag Created')
                            .setDescription(`Created tag \`${name}\`\nPreview it with \`/tag query ${name}\``)

        return void interaction.reply({ embeds: [embed], ephemeral: true })
    }


	async generateSlashCommand(): Promise<Record<string, unknown>> {
		return {
			name: 'Create Tag',
			type: ApplicationCommandType.Message
		}
	}
}

export = getTags;
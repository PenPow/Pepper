import Interaction from "../structures/Interaction";
import Client from "../structures/Client";
import { ApplicationCommandOptionChoice, AutocompleteInteraction, ButtonInteraction } from "discord.js";

class getTags extends Interaction {
	constructor(client: Client) {
		super(client, 'tags');
	}

	async run(interaction: ButtonInteraction | AutocompleteInteraction): Promise<void> {
        if(!interaction.isAutocomplete()) return;
		if(!interaction.responded) {
			const keys = await this.client.db.keys(`tags:${interaction.guildId}:${interaction.options.getFocused(false)}*`);
			const keyObject: ApplicationCommandOptionChoice[] = [];

			for(const key of keys) {
				keyObject.push({ name: key.split(':')[2], value: key.split(':')[2] })
			}

			interaction.respond(keyObject)
		}
	}
}

export = getTags;
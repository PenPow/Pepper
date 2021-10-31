import Interaction from "../structures/Interaction";
import Client from "../structures/Client";
import { interactionType } from "../types/ClientTypes";

class getTags extends Interaction {
	constructor(client: Client) {
		super(client, 'no-tag');
	}

	async run(interaction: interactionType): Promise<void> {
        if(!interaction.isSelectMenu()) return;
		
        await interaction.update({ content: 'Suggestion Sent!', components: [] });
        const option = interaction.values[0];

        const tag = await this.client.db.get(`tags:${interaction.guildId}:${option}`);

        if(!tag) return;

        return void interaction.followUp({ content: `*Tag Suggestion from <@${interaction.user.id}>*\n${this.client.utils.decrypt(tag)}`, ephemeral: false }).catch()
	}
}

export = getTags;
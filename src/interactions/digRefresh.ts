import Interaction from "../structures/Interaction";
import Client from "../structures/Client";
import { AutocompleteInteraction, ButtonInteraction, MessageActionRow, MessageButton } from "discord.js";
import Embed from "../structures/Embed";
import { digType, PunishmentColor } from "../types/ClientTypes";

class digRefresh extends Interaction {
	constructor(client: Client) {
		super(client, 'refresh-dig');
	}

	async run(interaction: ButtonInteraction | AutocompleteInteraction): Promise<void> {
        if(!interaction.isButton()) return;
		await interaction.deferUpdate();

        const domain = interaction.message.embeds[0].description.split('=')[1].split(' ')[0].replace('`', '');
        const type = interaction.message.embeds[0].description.split('=')[2].replace('`', '') as digType;

        const { Status, Answer } = await this.client.utils.handleDig(domain, type);

        if(Status !== 0) return void interaction.editReply({ components: [], embeds: [], content: 'An Unknown Error Occurred'})
        else {
            const embed = new Embed(interaction)
                .setColor(PunishmentColor.SOFTBAN)
                .setTitle('Dig Complete')
                .setDescription(interaction.message.embeds[0].description)
            
            for(const row of Answer || ['']) {
                Answer !== undefined ? embed.addField(`\`${row.name}\``, `**Data**: ${row.data}\n**TTL**: ${row.TTL}`, true) : embed.addField(`\`${domain}\``, `**No Results Found**`, true)
            }

            const row = new MessageActionRow()
                                .addComponents(
                                    new MessageButton()
                                            .setCustomId('refresh-dig')
                                            .setLabel('Refresh')
                                            .setStyle('PRIMARY')
                                )
            
            return void interaction.editReply({ embeds: [embed], components: [row] }).catch()
        }
	}
}

export = digRefresh;
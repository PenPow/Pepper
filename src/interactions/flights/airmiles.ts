import { CommandInteraction } from "discord.js";
import Client from "../../structures/Client";
import Command from "../../structures/Command";
import Embed from "../../structures/Embed";
import axios from "axios";

class AirMiles extends Command {
    constructor(client: Client) {
		super(client, {
			name: 'airmiles',
			usage: 'airmiles',
			description: 'Shows you the amount of airmiles you have earnt from the flights you have participated in',
			type: client.types.FLIGHTS,
			examples: ['airmiles'],
		});
	}

    async run(interaction: CommandInteraction): Promise<void> {
        const response = (await axios.get(`https://verify.eryn.io/api/user/${interaction.user.id}`)).data as IErynResponse;

        if(response.error) return this.sendErrorMessage(interaction, 'Command Failure', 'Failed to grab your user. Ensure you have verified through [here](https://verify.eryn.io).')

        const embed = new Embed(interaction)
            .setTitle(`<:Airplane:876506097308033025>  AirMiles for ${response.robloxUsername}`);

        embed.setDescription(`You have ${0} AirMiles`);

        interaction.editReply({ embeds: [embed] });
    }
}

export = AirMiles;

interface IErynResponse {
    status: 'ok' | 'error',
    robloxUsername?: string,
    robloxId?: string,
    error?: string,
    errorCode?: string,
    retryAfterSeconds?: number,
}
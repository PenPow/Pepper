import { Collection, CommandInteractionOption, Interaction } from "discord.js";
import Event from "../structures/Event";
import Client from "../structures/Client";

class interactionCreate extends Event {
	constructor(client: Client) {
		super(client, { name: 'interactionCreate', once: false });
	}

	async run(args: Array<Interaction>): Promise<void> {
		const [interaction] = args;
		if(!interaction.isCommand()) return;

		const cmd = interaction.commandName;

		const command = this.client.commands.get(cmd);

		if(command.guildOnly && !interaction.guild) return await interaction.reply({ content: 'This command can only be used in a guild channel.', ephemeral: true });

        const permissions = await command.checkPermissions(interaction);

		if(!permissions) return;

		command.run(interaction, interaction.options as unknown as Collection<string, CommandInteractionOption>);
	}
}

export = interactionCreate;
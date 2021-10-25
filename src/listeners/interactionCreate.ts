import { ButtonInteraction, Collection, CommandInteractionOption, Interaction } from "discord.js";
import Event from "../structures/Event";
import Client from "../structures/Client";

class interactionCreate extends Event {
	constructor(client: Client) {
		super(client, { name: 'interactionCreate', once: false });
	}

	async run(args: Array<Interaction>): Promise<void> {
		const [interaction] = args;
		if(!interaction.isCommand()) return void this.parseButtonInteraction(interaction as ButtonInteraction);

		const cmd = interaction.commandName;

		const command = this.client.commands.get(cmd);

		if(!this.client.isCommandInteraction(command)) return;

		if(command.guildOnly && !interaction.guild) return await interaction.reply({ content: 'This command can only be used in a guild channel.', ephemeral: true });

        const permissions = await command.checkPermissions(interaction);

		if(!permissions) return;

		command.run(interaction, interaction.options as unknown as Collection<string, CommandInteractionOption>);
	}

	async parseButtonInteraction(interaction: ButtonInteraction): Promise<void> {
		const buttonCmd = interaction.customId;
		const cmd = this.client.commands.get(buttonCmd);
		if(this.client.isCommandInteraction(cmd) || !cmd) return;

		cmd.run(interaction)
	}
}

export = interactionCreate;
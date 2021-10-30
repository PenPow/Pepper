import { AutocompleteInteraction, ButtonInteraction, ContextMenuInteraction, Interaction as InteractionStructure } from "discord.js";
import Event from "../structures/Event";
import Client from "../structures/Client";
import Interaction from "../structures/Interaction";

class interactionCreate extends Event {
	constructor(client: Client) {
		super(client, { name: 'interactionCreate', once: false });
	}

	async run(args: Array<InteractionStructure>): Promise<void> {
		const [interaction] = args;
	
		if(!interaction.isCommand()) return void this.parseOtherInteraction(interaction as ButtonInteraction | AutocompleteInteraction | ContextMenuInteraction);

		const cmd = interaction.commandName;
		const command = this.client.commands.get(cmd);
		if(!this.client.isCommandInteraction(command)) return;

		if(command.guildOnly && !interaction.guild) return await interaction.reply({ content: 'This command can only be used in a guild channel.', ephemeral: true });
        const permissions = await command.checkPermissions(interaction);
		if(!permissions) return;

		command.run(interaction);
	}

	async parseOtherInteraction(interaction: ButtonInteraction | AutocompleteInteraction | ContextMenuInteraction): Promise<void> {
		// @ts-expect-error multiple command types
		const interactionCmdName = interaction?.customId ?? ( interaction?.commandName + 's');

		const cmd = this.client.commands.get(interactionCmdName) as unknown as Interaction;
		if(cmd) cmd.run(interaction)
	}
}

export = interactionCreate;
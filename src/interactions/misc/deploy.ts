import { CommandInteraction } from 'discord.js';
import Client from "../../structures/Client";
import Command from "../../structures/Command";
import { ErrorType } from "../../types/ClientTypes";
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';

export default class DeployCommand extends Command {
    constructor(client: Client) {
		super(client, {
			name: 'deploy',
			description: 'Deploy Slash Commands',
			type: client.types.MISC,
		});
	}

    async run(interaction: CommandInteraction): Promise<void> {
        if(interaction.user.id !== '207198455301537793') return this.sendErrorMessage(interaction, { errorType: ErrorType.COMMAND_FAILURE, errorMessage: 'Unauthorized'})
        else {
            const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN);

            const array: unknown[] = [];

            this.client.commands.forEach((command) => {
                array.push(command.generateSlashCommand());
            })

            try {
                this.client.logger.info('Started refreshing application (/) commands');

                await rest.put(
                    Routes.applicationGuildCommands(this.client.user.id, process.env.DEVELOPER_GUILD),
                    { body: array },
                );

                this.client.logger.info('Successfully reloaded application (/) commands.');
                this.reply(interaction, { content: ':thumbsup: Successfully Reloaded application (/) commands.', ephemeral: true})
            }
            catch (error) {
                this.client.logger.error(error);
                this.sendErrorMessage(interaction, { errorType: ErrorType.EXTERNAL_ERROR, errorMessage: error.stack})
            }
        }
    }
}
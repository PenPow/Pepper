import { ApplicationCommandPermissionData, CommandInteraction } from 'discord.js';
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
            await interaction.deferReply({ ephemeral: true })

            const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN);

            const array: unknown[] = [];

            this.client.commands.forEach(async (command) => {
                const json = await command.generateSlashCommand()
                if(json) array.push(json);
            })

            try {
                this.client.logger.info('Started refreshing application (/) commands');

                await this.client.utils.sleep(1000 * 5)

                const sentCommands = await rest.put(
                    Routes.applicationGuildCommands(this.client.user.id, process.env.DEVELOPER_GUILD),
                    { body: array },
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                ) as any[];

                for(const command of sentCommands) {
                    if(!command.default_permission) {
                        const fetchedCommand = await this.client.guilds.cache.get(process.env.DEVELOPER_GUILD)?.commands.fetch(command.id)

                        const permissions = [{
                            id: process.env.DEVELOPER_ID,
                            type: 'USER',
                            permission: true
                        }] as ApplicationCommandPermissionData[]

                        await fetchedCommand.permissions.set({ permissions })
                    }
                }

                this.client.logger.info('Successfully reloaded application (/) commands.');
                this.reply(interaction, { content: ':thumbsup: Successfully Reloaded application (/) commands.', ephemeral: true})
            }
            catch (error) {
                this.client.logger.error(error);
                this.sendErrorMessage(interaction, { errorType: ErrorType.EXTERNAL_ERROR, errorMessage: error.stack})
            }
        }
    }

    async generateSlashCommand(): Promise<Record<string, unknown>> {
        return {
            name: this.name,
            description: this.description,
            default_permission: false,
        }
    }
}
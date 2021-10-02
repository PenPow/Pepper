import { CommandInteraction, Formatters } from 'discord.js';
import Client from "../../structures/Client";
import Command from "../../structures/Command";
import { ErrorType, PunishmentColor } from '../../types/ClientTypes';
import { ApplicationCommandOptionType } from 'discord-api-types/v9';
import { transpile, getParsedCommandLineOfConfigFile, sys } from "typescript";
import { inspect } from 'util';
import Embed from '../../structures/Embed';

export default class EvalCommand extends Command {
    constructor(client: Client) {
		super(client, {
			name: 'execute',
			description: 'Execute shell commands',
			type: client.types.MISC,
		});
	}

    async run(interaction: CommandInteraction): Promise<void> {
        if(interaction.user.id !== '207198455301537793') return this.sendErrorMessage(interaction, { errorType: ErrorType.COMMAND_FAILURE, errorMessage: 'Unauthorized'})
        else {
            await interaction.deferReply({ ephemeral: true })

            let evaled;
            let codeToRun = interaction.options.getString('command', true).replaceAll(/[“”]/gim, '"')

            if (codeToRun.includes("await ")) codeToRun = `(async () => {\n${codeToRun}\n})()`

            const options = getParsedCommandLineOfConfigFile(
                "tsconfig.json",
                {},
                {
                    ...sys,
                    onUnRecoverableConfigFileDiagnostic: console.error
                }).options
            options.sourceMap = false
            options.alwaysStrict = false

            const compiledCode = transpile(codeToRun, options);

            try {
                evaled = await eval(compiledCode);

                const inspected = inspect(evaled, { depth: 0, maxArrayLength: 5, getters: true })
                const embed = new Embed(interaction)
                                .setColor(PunishmentColor.UNBAN)
                                .setTitle('Code Evaluation')
                                .setDescription('The code was executed successfully! Here\'s the output')
                                .addFields(
                                    { name: "Input", value: Formatters.codeBlock("ts", codeToRun.substring(0, 1015)) },
                                    { name: "Compiled code", value: Formatters.codeBlock("js", compiledCode.replaceAll(";", "").substring(0, 1015)) },
                                    { name: "Output", value: Formatters.codeBlock("js", inspected.substring(0, 1015)) },
            
                                    {
                                        name: "Output type",
                                        value: evaled?.constructor.name === "Array" ? `${evaled.constructor.name}<${evaled[0]?.constructor.name}>` : evaled?.constructor.name ?? typeof evaled,
                                        inline: true
                                    },
                                    { name: "Output length", value: `${inspected.length}`, inline: true },
                                    { name: "Time taken", value: `${(Date.now() - interaction.createdTimestamp).toLocaleString()}ms`, inline: true }
                                )
                
                return void await this.reply(interaction, { embeds: [embed], ephemeral: true });
            } catch(error) {
                const embed = new Embed(interaction)
                                .setColor(PunishmentColor.BAN)
                                .setTitle('Code Evaluation')
                                .setDescription('An error occured while executing that code. Here\'s the error stack')
                                .addFields(
                                    { name: "Input", value: Formatters.codeBlock("ts", codeToRun.substring(0, 1015)) },
                                    { name: "Compiled code", value: Formatters.codeBlock("js", compiledCode.replaceAll(";", "").substring(0, 1015)) },
                                    { name: "Error", value: Formatters.codeBlock(error.stack.substring(0, 1017)) },
                
                                    { name: "Error Type", value: error.name, inline: true },
                                    { name: "Error length", value: `${error.stack.length}`, inline: true },
                                    { name: "Time taken", value: `${(Date.now() - interaction.createdTimestamp).toLocaleString()}ms`, inline: true }
                                )
                
                return void await this.reply(interaction, { embeds: [embed], ephemeral: true })
            }
        }
    }

    generateSlashCommand(): Record<string, unknown> {
        return {
            name: this.name,
            description: this.description,
            default_permission: false,
            options: [
                {
                    name: 'command',
                    type: ApplicationCommandOptionType.String,
                    description: 'Command/code to execute',
                    required: true,
                }
            ]
        }
    }
}
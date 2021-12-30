import { CommandInteraction, Formatters } from 'discord.js';
import Client from "../../structures/Client";
import Command from "../../structures/Command";
import { PunishmentColor } from '../../types/ClientTypes';
import { ApplicationCommandOptionType } from 'discord-api-types/v9';
import { transpile, getParsedCommandLineOfConfigFile, sys } from "typescript";
import { inspect } from 'util';
import Embed from '../../structures/Embed';
import fetch from 'node-fetch'

export default class EvalCommand extends Command {
        constructor(client: Client) {
        super(client, {
            name: 'execute',
            description: 'Run Arbitrary Code in a Sandboxed Environment',
            type: client.types.MISC,
        });
    }

        async run(interaction: CommandInteraction): Promise<void> {
                await interaction.deferReply({ ephemeral: true })
                if(interaction.user.id !== '207198455301537793' || interaction.options.getString('command', true).startsWith('--usePiston')) {
                        const res = await fetch('https://emkc.org/api/v2/piston/runtimes');
                        const runtimes = await res.json() as Record<string, unknown>[]

                        const latestVersion = (runtimes.filter(n => n.language === interaction.options.getString('language', true)).sort((a, b) => {
                                return a.version > b.version ? -1 : b.version > a.version ? 1 : 0;
                            })[0] || {}).version;

                        const options = {
                                "language": interaction.options.getString('language', true),
                                "version": latestVersion,
                                "files": [{
                                        "content": interaction.options.getString('command', true).replace('--usePiston', '').trim()
                                }],
                                "stdin": "",
                                "args": [] as string[],
                                "compile_timeout": 10000,
                                "run_timeout": 3000,
                                "compile_memory_limit": -1,
                                "run_memory_limit": -1
                         }

                        const response = await fetch('https://emkc.org/api/v2/piston/execute', { method: 'POST', body: JSON.stringify(options) })
                        const responseJSON = await response.json();

            const embed = new Embed(interaction)
                .setColor(PunishmentColor.UNBAN)
                .setTitle('Code Evaluation')
                .setDescription('The code was executed! Here\'s the output')
                .addFields(
                    { name: "Input", value: Formatters.codeBlock(interaction.options.getString('language', true), interaction.options.getString('command', true).replaceAll(/[“”]/gim, '"').replace('--usePiston', '').substring(0, 1015)).trim() },
                    { name: "Output", value: Formatters.codeBlock('markdown', responseJSON.run.output.substring(0, 1015)).trim() },
                    { name: "Output length", value: `${responseJSON.run.output.length}`, inline: true },
                    { name: "Time taken", value: `${(Date.now() - interaction.createdTimestamp).toLocaleString()}ms`, inline: true }
                )

            return void this.reply(interaction, { embeds: [embed], ephemeral: true })
                }
                else {
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
                                                                .setDescription('An error occurred while executing that code. Here\'s the error stack')
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

        async generateSlashCommand(): Promise<Record<string, unknown>> {
                const runtimes = [
                        {
                            "language": "bash",
                            "version": "5.1.0",
                            "aliases": [
                                "sh"
                            ]
                        },
                        {
                            "language": "dart",
                            "version": "2.12.1",
                            "aliases": []
                        },
                        {
                            "language": "dotnet",
                            "version": "5.0.201",
                            "aliases": [
                                "cs",
                                "csharp"
                            ]
                        },
                        {
                            "language": "c",
                            "version": "10.2.0",
                            "aliases": [
                                "gcc"
                            ],
                            "runtime": "gcc"
                        },
                        {
                            "language": "c++",
                            "version": "10.2.0",
                            "aliases": [
                                "cpp",
                                "g++"
                            ],
                            "runtime": "gcc"
                        },
                        {
                            "language": "go",
                            "version": "1.16.2",
                            "aliases": [
                                "go",
                                "golang"
                            ]
                        },
                        {
                            "language": "java",
                            "version": "15.0.2",
                            "aliases": []
                        },
                        {
                            "language": "lisp",
                            "version": "2.1.2",
                            "aliases": [
                                "lisp",
                                "cl",
                                "sbcl",
                                "commonlisp"
                            ]
                        },
                        {
                            "language": "lua",
                            "version": "5.4.2",
                            "aliases": [
                                "lua"
                            ]
                        },
                        {
                            "language": "csharp",
                            "version": "6.12.0",
                            "aliases": [
                                "mono",
                                "mono-csharp",
                                "mono-c#",
                                "mono-cs",
                                "c#",
                                "cs"
                            ],
                            "runtime": "mono"
                        },
                        {
                            "language": "basic",
                            "version": "6.12.0",
                            "aliases": [
                                "vb",
                                "mono-vb",
                                "mono-basic",
                                "visual-basic",
                                "visual basic"
                            ],
                            "runtime": "mono"
                        },
                        {
                            "language": "javascript",
                            "version": "16.3.0",
                            "aliases": [
                                "node-javascript",
                                "node-js",
                                "javascript",
                                "js"
                            ],
                            "runtime": "node"
                        },
                        {
                            "language": "powershell",
                            "version": "7.1.4",
                            "aliases": [
                                "ps",
                                "pwsh",
                                "ps1"
                            ],
                            "runtime": "pwsh"
                        },
                        {
                            "language": "python2",
                            "version": "2.7.18",
                            "aliases": [
                                "py2",
                                "python2"
                            ]
                        },
                        {
                            "language": "python",
                            "version": "3.9.4",
                            "aliases": [
                                "py",
                                "py3",
                                "python3"
                            ]
                        },
                        {
                            "language": "ruby",
                            "version": "3.0.1",
                            "aliases": [
                                "ruby3",
                                "rb"
                            ]
                        },
                        {
                            "language": "rust",
                            "version": "1.50.0",
                            "aliases": [
                                "rs"
                            ]
                        },
                        {
                            "language": "swift",
                            "version": "5.3.3",
                            "aliases": [
                                "swift"
                            ]
                        },
                        {
                            "language": "typescript",
                            "version": "4.2.3",
                            "aliases": [
                                "ts",
                                "node-ts",
                                "tsc"
                            ]
                        }
                    ]

                const runtimesArray: Record<string, string>[] = [];

                for(const item of runtimes) {
                        runtimesArray.push({ name: this.client.utils.capitalize(item.language), value: item.language })
                }

                return {
                        name: this.name,
                        description: this.description,
                        options: [
                                {
                                        name: 'command',
                                        type: ApplicationCommandOptionType.String,
                                        description: 'Command/code to execute',
                                        required: true,
                                },
                                {
                                        name: 'language',
                                        type: ApplicationCommandOptionType.String,
                                        description: 'Programming Language to Parse',
                                        required: true,
                                        choices: runtimesArray
                                }
                        ]
                }
        }
}
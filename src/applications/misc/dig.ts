import { ApplicationCommandOptionType } from 'discord-api-types';
import { CommandInteraction, MessageActionRow, MessageButton } from 'discord.js';
import Client from "../../structures/Client";
import isValidDomain from 'is-valid-domain';
import Command from "../../structures/Command";
import { digType, ErrorType, PunishmentColor } from '../../types/ClientTypes';
import Embed from '../../structures/Embed';
import { DNS_ERROR } from '../../utils/BotUtils';

export default class DigCommand extends Command {
    constructor(client: Client) {
		super(client, {
			name: 'dig',
			description: 'Run a DNS Probe on a URL or IP',
			type: client.types.MISC,
		});
	}

    async run(interaction: CommandInteraction): Promise<void> {
        await interaction.deferReply({ ephemeral: true })

        const domain = interaction.options.getString('domain', true);
        let type = interaction.options.getString('type', false) as digType;

        if(type === null) type = 'A';

        if(!isValidDomain(domain.trim().toLowerCase().replace(/^[a-z][a-z0-9+.-]+:\/\/(.+)$/i, '$1'), { subdomain: true, topLevel: true})) return this.sendErrorMessage(interaction, { errorType: ErrorType.INVALID_ARGUMENT, errorMessage: DNS_ERROR[6] })

        const { status, question, answer } = await this.client.utils.handleDig(domain, type);

        if(status !== 0) return this.sendErrorMessage(interaction, { errorType: ErrorType.COMMAND_FAILURE, errorMessage: DNS_ERROR[status] ?? 'An Unknown Error Occurred!' })
        else {
            const embed = new Embed(interaction)
                .setColor(PunishmentColor.SOFTBAN)
                .setTitle('Dig Complete')
                .setDescription(`\`query=${question[0].name} type=${type}\``)
            
            for(const row of answer || ['']) {
                answer !== undefined ? embed.addField(`\`${row.name}\``, `**Data**: ${row.data}\n**TTL**: ${row.TTL}`, true) : embed.addField(`\`${domain}\``, `**No Results Found**`, true)
            }

            const row = new MessageActionRow()
                                .addComponents(
                                    new MessageButton()
                                            .setCustomId('refresh-dig')
                                            .setLabel('Refresh')
                                            .setStyle('PRIMARY')
                                )
            
            return void this.reply(interaction, { embeds: [embed], ephemeral: true, components: [row] })
        }
    }

    async generateSlashCommand(): Promise<Record<string, unknown>> {
        const DNS_TYPES = ['A', 'AAAA', 'CNAME', 'MX', 'NS', 'SRV', 'TXT', 'PTR', 'SOA']
        return {
            name: this.name,
            description: this.description,
            options: [{
                name: 'domain',
                description: 'The domain to lookup',
                type: ApplicationCommandOptionType.String,
                required: true,
            },
            {
                name: 'type',
                description: 'DNS record type to lookup',
                help: `Supported types:\n${DNS_TYPES.map(type => `  ${type}`).join('\n')}\n\nDefaults to \`A\` records.`,
                type: ApplicationCommandOptionType.String,
                required: false,
                choices: DNS_TYPES.map(type => ({
                    name: `${type} records`,
                    value: type,
                })),
            }]
        }
    }
}
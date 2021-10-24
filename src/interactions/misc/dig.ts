import { ApplicationCommandOptionType } from 'discord-api-types';
import { CommandInteraction } from 'discord.js';
import Client from "../../structures/Client";
import isValidDomain from 'is-valid-domain';
import Command from "../../structures/Command";
import { ErrorType, PunishmentColor } from '../../types/ClientTypes';
import fetch from 'node-fetch';
import Embed from '../../structures/Embed';

const DNS_ERROR: Record<number, string> = {
    0: 'Unknown Error',
    1: 'Format Error',
    2: 'An unexpected server failure occurred when looking up the domain',
    3: 'A non-existent domain was requested and could not be found',
    4: 'A request was made that is not implemented  by the resolver',
    5: 'The query was refused by the DNS resolver',
};

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
        let type = interaction.options.getString('type', false);

        if(type === null) type = 'A';

        if(!isValidDomain(domain.trim().toLowerCase().replace(/^[a-z][a-z0-9+.-]+:\/\/(.+)$/i, '$1'), { subdomain: true, topLevel: true})) return this.sendErrorMessage(interaction, { errorType: ErrorType.INVALID_ARGUMENT, errorMessage: 'A domain name could not be parsed' })

        const query = new URL('https://cloudflare-dns.com/dns-query');
        query.searchParams.set('name', domain);
        query.searchParams.set('type', type.toLowerCase());

        const res = await fetch(query.href, {
            headers: {
                Accept: 'application/dns-json',
            },
        });

        const { Status, Question, Answer } = await res.json();

        if(Status !== 0) return this.sendErrorMessage(interaction, { errorType: ErrorType.EXTERNAL_ERROR, errorMessage: DNS_ERROR[Status] ?? 'An Unknown Error Occurred!' })
        else {
            const embed = new Embed(interaction)
                .setColor(PunishmentColor.PUNISHMENT_REMOVE)
                .setTitle('Dig Complete')
                .setDescription(`\`query=${Question[0].name} type=${type}\``)
            
            for(const row of Answer || ['']) {
                Answer !== undefined ? embed.addField(`\`${row.name}\``, `**Data**: ${row.data}\n**TTL**: ${row.TTL}`, true) : embed.addField(`\`${domain}\``, `**No Results Found**`, true)
            }
            
            return void this.reply(interaction, { embeds: [embed], ephemeral: true })
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
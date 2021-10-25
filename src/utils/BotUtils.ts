/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { Guild } from "discord.js";
import Client from "../structures/Client";
import { GuildSettings } from '../types/ClientTypes';
import fetch from "node-fetch";

export async function guildSettingsManager(guild: Guild): Promise<GuildSettings> {
    const object = await JSON.parse(await (guild.client as Client).db.get(`${guild.id}-settings`))
    return object === null ? { logChannel: undefined } : object;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function manageMaliciousURL(client: Client, raw: any): void {
    for(const item of raw.matches) {
        client.cache.set(item.threat.url, item);
    }
}

export async function handleDig(domain: string, type: 'A' | 'AAAA' | 'CNAME' | 'MX' | 'NS' | 'SRV' | 'TXT' | 'PTR' | 'SOA') {
    const query = new URL('https://cloudflare-dns.com/dns-query');
    query.searchParams.set('name', domain);
    query.searchParams.set('type', type.toLowerCase());

    const res = await fetch(query.href, {
        headers: {
            Accept: 'application/dns-json',
        },
    });

    return await res.json();
}

export const DNS_ERROR: Record<number, string> = {
    0: 'Unknown Error',
    1: 'Format Error',
    2: 'An unexpected server failure occurred when looking up the domain',
    3: 'A non-existent domain was requested and could not be found',
    4: 'A request was made that is not implemented  by the resolver',
    5: 'The query was refused by the DNS resolver',
    6: 'A domain name could not be parsed'
};
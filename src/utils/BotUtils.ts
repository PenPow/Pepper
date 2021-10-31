/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { Guild } from "discord.js";
import Client from "../structures/Client";
import { digType, ErrorLog, ErrorType, GuildSettings } from '../types/ClientTypes';
import fetch from "node-fetch";
import { stripIndents } from "common-tags";
import * as packageJSON from '../../package.json';
import { constants, privateDecrypt, publicEncrypt,  } from "node:crypto";

export async function guildSettingsManager(guild: Guild): Promise<GuildSettings> {
    const object = await JSON.parse(this.client.utils.decrypt(await (guild.client as Client).db.get(`${guild.id}-settings`)))
    return object === null ? { logChannel: undefined } : object;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function manageMaliciousURL(client: Client, raw: any): void {
    for(const item of raw.matches) {
        client.cache.set(item.threat.url, item);
    }
}

export async function handleDig(domain: string, type: digType) {
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

export async function generateErrorLog(options: ErrorLog): Promise<string | null> {
    const str = stripIndents`
    # PEPPER ERROR LOG
        This log file contains the information needed for support to diagnose and escalate issues internally. Should you contact support after receiving this message, please provide them with this file,
        and any other relevant information so we can support you.
    
    ## ENVIRONMENT INFORMATION

        ### PACKAGES
            - DiscordJS Version ▸ ${packageJSON.dependencies["discord.js"]}
            - DAPI Types Version ▸ ${packageJSON.dependencies["discord-api-types"]}
            - Node-Fetch Version ▸ ${packageJSON.dependencies["node-fetch"]}
    
        ### NODE ENVIRONMENT
            - VERSION ▸ ${process.version}
            - ARCHITECTURE ▸ ${process.arch}
            - PID ▸ ${process.pid}
            - PLATFORM ▸ ${process.platform}
            - DOCKER ▸ ${options.client.utils.isDocker()}
    
        ### CLIENT INFORMATION
            - READY AT ▸ ${options.client.readyAt.toUTCString()} (UTC)
            - UPTIME ▸ ${options.client.uptime.toString()}
    
        ### COMMAND INFORMATION
            - NAME ▸ ${options.command.name}
            - CLIENT PERMISSIONS ▸ ${options.command.clientPermissions}
            - USER PERMISSIONS ▸ ${options.command.userPermissions}
            - TYPE ▸ \`${options.command.type}\`
            - SATISFIES PERMISSIONS CHECK ▸ ${await options.command.checkPermissions(options.interaction)}

        ### INTERACTION INFORMATION
            - APPLICATION ID ▸ ${options.interaction.applicationId}
            - DEFERRED ▸ ${options.interaction.deferred}
            - EPHEMERAL ▸ ${options.interaction.ephemeral || false}
            - TYPE ▸ \`${options.interaction.type.toString()}\`
    
        ### ERROR INFORMATION
            - MESSAGE/STACK ▸ ${options.options.errorMessage}
            - ERROR TYPE ▸ \`${options.options.errorType.toString()}\`
            - INTERNAL ISSUE ▸ ${options.options.errorType == ErrorType.COMMAND_FAILURE || options.options.errorType == ErrorType.DATABASE_ERROR  ? true : false}
    
    ## NOTES
        This report was automatically generated at ${new Date().toLocaleString()} by Pepper.
    `.trim();

    const res = await fetch('https://www.toptal.com/developers/hastebin/documents', {
				method: 'POST',
				body: str,
				headers: { 'Content-Type': 'text/plain' },
	});

    const json = await res.json();

    return json.key ? 'https://hastebin.com/' + json.key + '.md' : null;
}

export function encrypt(data: string): string {
    const encryptedData = publicEncrypt({
        // @ts-expect-error global
        key: global.PUBLIC_ENCRYPTION_KEY.toString(),
        padding: constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: "sha256"
    }, Buffer.from(data));

    return encryptedData.toString('base64');
}

export function decrypt(encryptedData: string): string {
    const data = privateDecrypt({
        // @ts-expect-error global
        key: global.PRIVATE_ENCRYPTION_KEY.toString(),
        padding: constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: "sha256",
        passphrase: ''
    }, Buffer.from(encryptedData, 'base64'));

    return data.toString();
}
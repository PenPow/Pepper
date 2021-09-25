/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { Guild } from "discord.js";
import Client from "../structures/Client";
import { GuildSettings } from '../types/ClientTypes';

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
import Client from '../structures/Client';
import { Punishment, PunishmentType, GuildSettings, PunishmentColor } from '../types/ClientTypes';
import { Guild, Permissions, MessageEmbed, TextBasedChannels, TextChannel, Message } from 'discord.js';
import { stripIndents } from 'common-tags'

export async function createCase(options: Punishment): Promise<Message> {
    const { guild, action, moderator, target, assortedOptions } = options;

    options.caseNo = await getCaseNumber(guild, guild.client as Client);
    options.reason = `Mod: ${moderator.user.tag} | ${options.reason !== '' ? options.reason : 'No Reason Specified'}`;

    await (guild.client as Client).db.set(`${guild.id}-case`, this.client.utils.encrypt((options.caseNo + 1).toString()));

    try {
        switch(action) {
            case PunishmentType.BAN:
                await guild.bans.create(target.id, { reason: options.reason, days: assortedOptions.deleteMessageDays ?? 0 })
                options.color = PunishmentColor.BAN;
                break;
            case PunishmentType.KICK:
                await guild.members.kick(target.id, options.reason);
                options.color = PunishmentColor.KICK;
                break;
            case PunishmentType.SOFTBAN:
                await guild.bans.create(target.id, { reason: options.reason, days: assortedOptions.deleteMessageDays ?? 1 })
                await guild.bans.remove(target.id, options.reason);
                options.color = PunishmentColor.SOFTBAN;
                break;
            case PunishmentType.WARN:
                options.color = PunishmentColor.WARN;
                break;
            case PunishmentType.RESTRICT_EMBED:
                options.color = PunishmentColor.RESTRICT_EMBED;
                break;
            case PunishmentType.RESTRICT_EMOJI:
                options.color = PunishmentColor.RESTRICT_EMOJI;
                break;
            case PunishmentType.RESTRICT_MUTE:
                options.color = PunishmentColor.RESTRICT_MUTE;
                break;
            case PunishmentType.RESTRICT_REACT:
                options.color = PunishmentColor.RESTRICT_REACT;
                break;
        }
    }
    catch(e) {
        return e;
    }

    await (guild.client as Client).db.set(`${guild.id}-case-${options.caseNo}`, JSON.stringify(this.client.utils.encrypt(options)))

    return await generateCaseLog(options)
}

export async function getCaseNumber(guild: Guild, client: Client): Promise<number> {
    return isNaN(parseInt(this.client.utils.decrypt(await client.db.get(`${guild.id}-case`)))) ? 1 : parseInt(this.client.utils.decrypt(await client.db.get(`${guild.id}-case`)));
}

export async function generateCaseLog(options: Punishment): Promise<Message> {
    const { guild, caseNo, action, actionExpiration, reason, moderator, target, reference, channel, color } = options;

    const guildSettings: GuildSettings = await (guild.client as Client).utils.guildSettingsManager(guild);

    let logChannel;
    guildSettings?.logChannel ? logChannel = (await guild.channels.fetch(guildSettings.logChannel).catch() as TextChannel) : logChannel = null;

    if(logChannel && logChannel.viewable && logChannel.permissionsFor(guild.client.user).has([Permissions.FLAGS.SEND_MESSAGES, Permissions.FLAGS.EMBED_LINKS, Permissions.FLAGS.VIEW_CHANNEL])) {
        let description = stripIndents`**Member**: \`${target.tag}\` (${target.id})
        **Action**: ${action}
        PLACEHOLDER
        **Reason**: ${reason.split(' | ')[1]}`

        if(actionExpiration !== undefined) {
            description = description.replace('PLACEHOLDER', `**Expiration**: <t:${Math.round(actionExpiration)}:R>`)
        }
        else {
            description = stripIndents`**Member**: \`${target.tag}\` (${target.id})
            **Action**: ${action}
            **Reason**: ${reason.split(' | ')[1]}`
        }

        
        if(reference !== undefined) {
            const referenceChannel = await guild.channels.fetch(channel) as TextBasedChannels;
            const referenceMessage = await referenceChannel.messages.fetch('891216539020296212');

            if(referenceMessage) {
                description += `\n**Reference**: [#${caseNo}](${referenceMessage.url})`
            }
        }

        const embed = new MessageEmbed().setColor(color).setAuthor(`${moderator.user.tag} (${moderator.id})`).setFooter(`Case ${caseNo}`).setTimestamp().setThumbnail(target.displayAvatarURL({ dynamic: true, format: 'webp', size: 512})).setDescription(description);

        return await logChannel.send({ embeds: [embed] })
    }
}
import { Guild, GuildMember, User, Snowflake } from 'discord.js';

export enum CommandTypes {
    ADMIN = 'admin',
    INFO = 'info',
    FUN = 'fun',
    MISC = 'misc',
    MOD = 'mod',
    TAGS = 'tags'
}

export type Callback = <T>(t: T) => void

export enum PunishmentType {
    BAN = 'Ban',
    KICK = 'Kick',
    SOFTBAN = 'Softban',
    WARN = 'Warn',
    PUNISHMENT_REMOVE = 'Punishment Remove',
    RESTRICT_MUTE = 'Restrict - `Mute`',
    RESTRICT_EMBED = 'Restrict - `Embed`',
    RESTRICT_REACT = 'Restrict - `React`',
    RESTRICT_EMOJI = 'Restrict - `Emoji`',
}

export enum PunishmentColor {
    BAN = '#ff5c5c',
    KICK = '#ffdc5c',
    SOFTBAN = '#f79454',
    WARN = '#ffdc5c',
    PUNISHMENT_REMOVE = '#202225',
    UNBAN = '#5cff9d',
    RESTRICT_MUTE = '#ffdc5c',
    RESTRICT_EMBED = '#ffdc5c',
    RESTRICT_REACT = '#ffdc5c',
    RESTRICT_EMOJI = '#ffdc5c',
}

export interface Punishment {
    guild: Guild,
    caseNo: number | undefined
    action: PunishmentType,
    actionExpiration: number | undefined,
    reason: string,
    moderator: GuildMember | { user: { tag: string }, id: Snowflake},
    target: User,
    reference: Snowflake | undefined,
    channel: Snowflake,
    color?: PunishmentColor,
    assortedOptions?: AssortedOptions,
}

export interface AssortedOptions {
    deleteMessageDays?: number,
}

export interface GuildSettings {
    logChannel: Snowflake | undefined
}
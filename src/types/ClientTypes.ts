import { Guild, GuildMember, User, Snowflake, InteractionReplyOptions, BitFieldResolvable, PermissionString, CommandInteraction } from 'discord.js';
import Client from '../structures/Client';
import Command from '../structures/Command';

export enum CommandType {
    ADMIN,
    INFO,
    FUN,
    MISC,
    MOD,
}

export enum ErrorType {
    INVALID_ARGUMENT = 'INVALID_ARGUMENT',
    COMMAND_FAILURE = 'COMMAND_FAILURE',
    EXTERNAL_ERROR = 'EXTERNAL_ERROR',
    DATABASE_ERROR = 'DATABASE_ERROR'
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

export interface ErrorSettings {
    errorType: ErrorType,
    errorMessage?: string,
}

export interface ResponseOptions extends InteractionReplyOptions {
    followUp?: boolean,
}

export interface CommandConstructor {
    name: string,
    description: string
    type: CommandType,
    clientPermissions?: Array<BitFieldResolvable<PermissionString, bigint>>,
    userPermissions?: Array<BitFieldResolvable<PermissionString, bigint>>
    extendedDescription?: string,
    guildOnly?: boolean
}

export type digType = 'A' | 'AAAA' | 'CNAME' | 'MX' | 'NS' | 'SRV' | 'TXT' | 'PTR' | 'SOA'

export interface ErrorLog { 
    interaction: CommandInteraction, 
    client: Client, 
    command: Command,
    options: ErrorSettings
}
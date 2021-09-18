import SignalEmbed from "./Embed";
import Client from './Client';
import permissions from "../utils/permissions.json";
import { CommandTypes } from '../types/ClientTypes';
import { BitFieldResolvable, Collection, CommandInteraction, CommandInteractionOption, GuildChannel, GuildMember, Permissions, PermissionString } from "discord.js";
import Base from "./Base";

class Command extends Base {
    public name: string;
    public usage: string;
    public description: string;
    public type: CommandTypes;
    public clientPermissions: Array<BitFieldResolvable<PermissionString, bigint>>;
    public userPermissions: Array<BitFieldResolvable<PermissionString, bigint>> | null;
    public examples: Array<string>;
    public guildOnly: boolean;
    public disabled: boolean;

    constructor(client: Client, options: Record<string, unknown>) {
        super(client);

        this.validateOptions(client, options);
        this.name = options.name as string;
        this.usage = options.usage as string || options.name as string;
        this.description = options.description as string || '';
        this.type = options.type as CommandTypes || client.types.MISC;
        this.clientPermissions = options.clientPermissions as Array<BitFieldResolvable<PermissionString, bigint>> || ['SEND_MESSAGES', 'EMBED_LINKS'];
        this.userPermissions = options.userPermissions as Array<BitFieldResolvable<PermissionString, bigint>> || null;
        this.examples = options.examples as string[] || null;
        this.disabled = !!(options.disabled || false);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public run(interaction: CommandInteraction, args: Collection<string, CommandInteractionOption>): void | Promise<void> {
        throw new Error(`${this.name} has no run function`);
    }

    public generateSlashCommand(): Record<string, unknown> {
        return {
            name: this.name,
            description: this.description,
        }
    }

    public async checkPermissions(interaction: CommandInteraction): Promise<boolean> {
        if(!(interaction.channel as GuildChannel).permissionsFor(interaction.guild.me).has([Permissions.FLAGS.SEND_MESSAGES, Permissions.FLAGS.EMBED_LINKS])) return false;

        const clientPermission = this.checkClientPermissions(interaction);
        const userPermission = await this.checkUserPermissions(interaction);

        return clientPermission && userPermission ? true : false;
    }

    private checkClientPermissions(interaction: CommandInteraction): boolean {
        // @ts-expect-error Globals are Not Recommended, but needed in this case
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const missingPermissions = (interaction.channel as GuildChannel).permissionsFor(interaction.guild.me).missing(this.clientPermissions).map((p: any) => permissions[p as any]) as Array<PermissionString>;

        if(missingPermissions.length !== 0) {
            const embed = new SignalEmbed(interaction)
                .setAuthor(`${this.client.user.tag}`, (interaction.client as Client).user.displayAvatarURL({ dynamic: true }))
                .setTitle('Missig Bot Permissions')
                .setDescription(`\`\`\`diff\n${missingPermissions.map(p => `- ${p}`).join('\n')}\`\`\``);

            interaction.reply({ embeds: [embed], ephemeral: true });

            return false;
        }

        return true;
    }

    private async checkUserPermissions(interaction: CommandInteraction): Promise<boolean> {
        const member = await interaction.guild.members.fetch((interaction.member as GuildMember).id);

        if(member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) return true;
        if(this.userPermissions !== null) {
            // @ts-expect-error Globals are Not Recommended, but needed in this case
            const missingPermissions = (interaction.channel as GuildChannel).permissionsFor(interaction.user).missing(this.userPermissions).map(p => permissions[p]);

            if(missingPermissions.length !== 0) {
				const embed = new SignalEmbed(interaction)
					.setAuthor(`${interaction?.user?.tag}`, interaction?.user?.displayAvatarURL({ dynamic: true }))
					.setTitle(`Missing User Permissions`)
					.setDescription(`\`\`\`diff\n${missingPermissions.map(p => `- ${p}`).join('\n')}\`\`\``);

				interaction.reply({ embeds: [embed], ephemeral: true });
				return false;
			}
        }

        return true;
    }

    protected validateOptions(client: Client, options: Record<string, unknown>): void {
        if(!client) throw new Error('No client was found');

        if(typeof options !== 'object') throw new TypeError('Options is not an Object');

        if(typeof options.name !== 'string') throw new TypeError('Command name is not a string');
        if(options.name !== options.name.toLowerCase()) throw new Error('Command name is not lowecase');

        if(client.commands.get(options.name)) throw new ReferenceError(`Command ${options.name} already exists`);

        if(options.usage && typeof options.usage !== 'string') throw new TypeError('Command Usage is not a string');

        if(options.description && typeof options.description !== 'string') throw new TypeError('Command Description is not a string');

        if(options.type && typeof options.type !== 'string') throw new TypeError('Command type is not a string');
        if(options.type && !Object.values(client.types).includes(options.type as CommandTypes)) throw new Error('Command Type does not exist');

        if(options.clientPermissions) {
            if(!Array.isArray(options.clientPermissions)) throw new TypeError('Client Permissions is not an array of strings');

            for(const perm of options.clientPermissions) {
                //@ts-expect-error  Globals are Not Recommended, but needed in this case
                if(!permissions[perm]) throw new RangeError(`Invalid command clientPermission: ${perm}`);
            }
        }

        if(options.userPermissions) {
            if(!Array.isArray(options.userPermissions)) throw new TypeError('User Permissions is not an array of strings');

            for(const perm of options.userPermissions) {
                //@ts-expect-error Globals are Not Recommended, but needed in this case
                if(!permissions[perm]) throw new RangeError(`Invalid command userPermission: ${perm}`);
            }
        }

        if(options.examples && !Array.isArray(options.examples)) throw new TypeError('Examples are not an array');

        if(options.ownerOnly && typeof options.ownerOnly !== 'boolean') throw new TypeError('Command ownerOnly is not a boolean');

        if (options.disabled && typeof options.disabled !== 'boolean') throw new TypeError('Command disabled is not a boolean');

        if(options.errorTypes && !Array.isArray(options.errorTypes)) throw new TypeError('Error types are not an array');
        if(options.guilds && !Array.isArray(options.guilds)) throw new TypeError('Guilds are not an array');
    }
}

export default Command;
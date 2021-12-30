import SignalEmbed from "./Embed";
import Client from './Client';
import permissions from "../utils/permissions.json";
import { CommandType, ResponseOptions, ErrorSettings, ErrorType, PunishmentColor, CommandConstructor } from '../types/ClientTypes';
import { BitFieldResolvable, CommandInteraction, GuildChannel, GuildMember, Message, MessageActionRow, MessageButton, Permissions, PermissionString } from "discord.js";
import Base from "./Base";
import Embed from "./Embed";

class Command extends Base {
    public name: string;
    public description: string;
    public extendedDescription: string;
    public type: CommandType;
    public guildOnly: boolean;
    public clientPermissions: Array<BitFieldResolvable<PermissionString, bigint>>;
    public userPermissions: Array<BitFieldResolvable<PermissionString, bigint>> | null;

    constructor(client: Client, options: CommandConstructor) {
        super(client);

        this.name = options.name;
        this.description = options.description;
        this.type = options.type || client.types.MISC;
        this.guildOnly = options.guildOnly || false;
        this.extendedDescription = options.extendedDescription || options.description;
        this.clientPermissions = options.clientPermissions || ['SEND_MESSAGES', 'EMBED_LINKS'];
        this.userPermissions = options.userPermissions || null;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public run(interaction: CommandInteraction): void | Promise<void> {
        throw new Error(`${this.name} has no run function`);
    }

    protected async reply(interaction: CommandInteraction, options: ResponseOptions): Promise<Message | string> {
        if(!options.ephemeral) options.fetchReply = true;

        try {
            if(interaction.deferred || interaction.replied) {
                if(options.followUp) {
                    delete options.followUp;
                    return await interaction.followUp(options) as Message
                }
                else {
                    if(options.followUp) delete options.followUp;
                    return await interaction.editReply(options) as Message
                }
        }
            else {
                if(options.followUp) delete options.followUp;
                return await interaction.reply(options) as unknown as Message
            }
        }
        catch(err) {
            return null
        }
    }

    public async generateSlashCommand(): Promise<Record<string, unknown>> {
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
        // @ts-expect-error Cant be bothered working out types for the permissions
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const missingPermissions = (interaction.channel as GuildChannel).permissionsFor(interaction.guild.me).missing(this.clientPermissions).map((p: any) => permissions[p as any]) as Array<PermissionString>;

        if(missingPermissions.length !== 0) {
            const embed = new SignalEmbed(interaction)
                .setAuthor(`${this.client.user.tag}`, (interaction.client as Client).user.displayAvatarURL({ dynamic: true }))
                .setTitle('Missing Bot Permissions')
                .setDescription(`\`\`\`diff\n${missingPermissions.map(p => `- ${p}`).join('\n')}\`\`\``);

            this.reply(interaction, { embeds: [embed], ephemeral: true, followUp: false });

            return false;
        }

        return true;
    }

    protected async sendErrorMessage(interaction: CommandInteraction, options: ErrorSettings): Promise<void> {
        const embed = new Embed(interaction)
            .setTitle(`:warning: An Error Occurred!`)
            .setDescription(`Looks like we have an issue on our hands! ${options.errorType == ErrorType.EXTERNAL_ERROR || options.errorType == ErrorType.DATABASE_ERROR  ? 'This seems to be an issue with Pepper itself, we are actively working on the issue, and it should be resolved shortly.' : 'This seems to be an error with the way the command was used. Check your inputs to make sure they are not invalid!'}\n\n*If you wish to talk to our support team, please send them the attached log file!*`)
            .setColor(PunishmentColor.BAN)
            
        if(options.errorMessage) embed.addField('Message', `\`\`\`diff\n- ${options.errorType}\n+ ${options.errorMessage}\`\`\``);

        await this.reply(interaction, { embeds: [embed], ephemeral: true, followUp: true })
    }

    private async checkUserPermissions(interaction: CommandInteraction): Promise<boolean> {
        const member = await interaction.guild.members.fetch((interaction.member as GuildMember).id);

        if(member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) return true;
        if(this.userPermissions !== null) {
            // @ts-expect-error Code works, cant be bothered figuring out types for this
            const missingPermissions = (interaction.channel as GuildChannel).permissionsFor(interaction.user).missing(this.userPermissions).map(p => permissions[p]);

            if(missingPermissions.length !== 0) {
				const embed = new SignalEmbed(interaction)
					.setAuthor(`${interaction?.user?.tag}`, interaction?.user?.displayAvatarURL({ dynamic: true }))
					.setTitle(`Missing User Permissions`)
					.setDescription(`\`\`\`diff\n${missingPermissions.map(p => `- ${p}`).join('\n')}\`\`\``);

				this.reply(interaction, { embeds: [embed], ephemeral: true, followUp: false });
				return false;
			}
        }

        return true;
    }
}

export default Command;
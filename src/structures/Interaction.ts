import { ButtonInteraction, AutocompleteInteraction, ContextMenuInteraction } from "discord.js";
import { ErrorSettings, ErrorType, PunishmentColor } from "../types/ClientTypes";
import Base from "./Base";
import Client from "./Client";
import Embed from "./Embed";

class Interaction extends Base {
    public readonly name: string;

    constructor(client: Client, name: string) {
        super(client);

        this.name = name;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    run(args: ButtonInteraction | AutocompleteInteraction | ContextMenuInteraction): void {
        throw new Error(`${this.name} has no run function`);
    }

    public async generateSlashCommand(): Promise<Record<string, unknown>> {
        return null;
    }

    protected async sendErrorMessage(interaction: ButtonInteraction | ContextMenuInteraction, options: ErrorSettings): Promise<void> {
        const embed = new Embed(interaction)
            .setTitle(`:warning: An Error Occurred!`)
            .setDescription(`Looks like we have an issue on our hands! ${options.errorType == ErrorType.EXTERNAL_ERROR || options.errorType == ErrorType.DATABASE_ERROR  ? 'This seems to be an issue with Pepper itself, we are actively working on the issue, and it should be resolved shortly.' : 'This seems to be an error with the way the command was used. Check your inputs to make sure they are not invalid!'}\n\n*If you wish to talk to our support team, please send them the attached log file!*`)
            .setColor(PunishmentColor.BAN)
            
        if(options.errorMessage) embed.addField('Message', `\`\`\`diff\n- ${options.errorType}\n+ ${options.errorMessage}\`\`\``);

        await interaction.reply({ embeds: [embed], ephemeral: true })
    }
}

export default Interaction
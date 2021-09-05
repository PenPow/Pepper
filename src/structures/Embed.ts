
import { MessageEmbed, CommandInteraction, GuildMember } from 'discord.js';

class SignalEmbed extends MessageEmbed {
	constructor(interaction: CommandInteraction, data = {}) {
		super(data);

		if(interaction === null) return;

		this.setTimestamp()
			.setColor(interaction.guild!!.me!!.displayHexColor)
			.setFooter((interaction.member as GuildMember).displayName, interaction.user.displayAvatarURL({ dynamic: true }));
	}
}

export default SignalEmbed;
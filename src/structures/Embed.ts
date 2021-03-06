import { MessageEmbed, CommandInteraction, GuildMember } from 'discord.js';

class Embed extends MessageEmbed {
	constructor(interaction: CommandInteraction, data = {}) {
		super(data);

		this.setTimestamp()
			.setColor(interaction.guild.me.displayHexColor)
			.setFooter((interaction.member as GuildMember).displayName, interaction.user.displayAvatarURL({ dynamic: true }));
	}
}

export default Embed;
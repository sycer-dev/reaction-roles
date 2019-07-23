import { Command } from 'discord-akairo';
import { Message } from 'discord.js';
import { Reaction } from '../../models/Reaction';
import { stripIndents } from 'common-tags';

export default class ListCommand extends Command {
	public constructor() {
		super('list', {
			aliases: ['list', 'show', 'all'],
			channel: 'guild',
			clientPermissions: ['SEND_MESSAGES'],
			description: {
				content: 'Lists all current reaction roles.'
			},
			category: 'Reaction Roles',
			userPermissions: ['MANAGE_ROLES']
		});
	}

	public async exec(msg: Message): Promise<Message | Message[]> {
		const reactions = this.client.settings!.reaction.filter(r => r.guildID === msg.guild!.id && r.active);
		if (!reactions.size) return msg.util!.reply('you have no live reaction roles!');

		const embed = this.client.util.embed()
			.setColor(this.client.config.color)
			.setTitle('Live Reaction Roles')
		let i = 1;

		for (const o of reactions.values()) {
			if (embed.fields.length > 25) continue;
			const emoji = o.emojiType === 'custom' ? this.client.emojis.get(o.emoji) : o.emoji;
			const role = await msg.guild!.roles.fetch(o.roleID);
			embed.addField(`Reaction Role #${i}`, stripIndents`
				**Message ID**: \`${o.messageID}\`
				**Channel**: ${this.client.channels.get(o.channelID)} \`[${this.client.channels.get(o.channelID)!.id}]\`
				**Emoji**: ${emoji}
				**Role**: ${role ? role : '@deleted role'} \`[${role ? role.id : '????'}]\`
			`, true);
			i++;
		}

		return msg.util!.reply({ embed });

	}
}


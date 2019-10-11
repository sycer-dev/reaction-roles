import { Command } from 'discord-akairo';
import { Message } from 'discord.js';
import { Reaction } from '../../models/Reaction';
import { stripIndents, oneLine } from 'common-tags';

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
			.setDescription(reactions.map(r => {
				const emoji = r.emojiType === 'custom' ? this.client.emojis.get(r.emoji) : r.emoji;
				return oneLine`[\`${r.id}\`] ${emoji}
					${this.client.channels.get(r.channelID) || '#deleted-channel'} 
					${msg.guild!.roles.get(r.roleID) || '@deleted-role'}
				`
			}).join('\n').substring(0, 2000));

		return msg.util!.reply({ embed });

	}
}


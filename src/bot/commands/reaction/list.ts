import { Command } from 'discord-akairo';
import { Message, Permissions } from 'discord.js';
import { oneLine } from 'common-tags';
import { EmojiType, Reaction } from '../../../database';

export default class ListCommand extends Command {
	public constructor() {
		super('list', {
			aliases: ['list', 'show', 'all'],
			channel: 'guild',
			category: 'Reaction Roles',
			description: {
				content: 'Lists all current reaction roles.',
			},
			clientPermissions: [Permissions.FLAGS.EMBED_LINKS],
			userPermissions: [Permissions.FLAGS.MANAGE_ROLES],
		});
	}

	public async exec(msg: Message): Promise<Message | Message[] | void> {
		const reactions = await Reaction.find({ guildID: msg.guild!.id });
		if (!reactions.length) return msg.util?.reply('you have no live reaction roles!');

		const embed = this.client.util
			.embed()
			.setTitle('Live Reaction Roles')
			.setDescription(
				reactions
					.map(r => {
						const emoji = r.emojiType === EmojiType.CUSTOM ? this.client.emojis.cache.get(r.emoji) : r.emoji;
						return oneLine`[\`${r.id}\`] ${emoji}
					${this.client.channels.cache.get(r.channelID) || '#deleted-channel'} 
					${msg.guild!.roles.cache.get(r.roleID) || '@deleted-role'}
				`;
					})
					.join('\n')
					.substring(0, 2048),
			);

		return msg.util?.send({ embed });
	}
}

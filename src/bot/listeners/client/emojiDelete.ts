import { Listener } from 'discord-akairo';
import { GuildEmoji } from 'discord.js';
import { In } from 'typeorm';
import { EmojiType, Reaction } from '../../../database';

export default class EmojiDeleteListener extends Listener {
	public constructor() {
		super('emojiDelete', {
			emitter: 'client',
			event: 'emojiDelete',
			category: 'client',
		});
	}

	public async exec(emoji: GuildEmoji): Promise<void> {
		const rows = await Reaction.find({ emojiType: EmojiType.CUSTOM, emoji: emoji.id });
		if (rows.length) {
			Reaction.createQueryBuilder()
				.update()
				.set({ active: false })
				.where({ id: In(rows.map(r => r.id)) });
		}
	}
}

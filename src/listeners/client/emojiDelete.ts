import { Listener } from 'discord-akairo';
import { GuildEmoji } from 'discord.js';

export default class EmojiDeleteListener extends Listener {
	public constructor() {
		super('emojiDelete', {
			emitter: 'client',
			event: 'emojiDelete',
			category: 'client'
		});
	}

	public exec(emoji: GuildEmoji): void {
		const existing = this.client.settings!.reaction.filter(r => r.emoji === emoji.id && r.emojiType === 'custom');
		if (!existing.size) return;
		for (const c of existing.values()) {
			this.client.settings!.set('reaction', { id: c.id }, { active: false });
		}
	}
}

import { Listener } from 'discord-akairo';
import { Message } from 'discord.js';

export default class MessageDeleteListener extends Listener {
	public constructor() {
		super('messageDelete', {
			emitter: 'client',
			event: 'messageDelete',
			category: 'client'
		});
	}

	public exec(msg: Message): void {
		const existing = this.client.settings!.reaction.filter(r => r.messageID === msg.id);
		if (!existing.size) return;
		for (const c of existing.values()) {
			this.client.settings!.set('reaction', { id: c.id }, { active: false });
		}
	}
}

import { Listener } from 'discord-akairo';
import { GuildChannel } from 'discord.js';

export default class ChannelDeleteListener extends Listener {
	public constructor() {
		super('channelDelete', {
			emitter: 'client',
			event: 'channelDelete',
			category: 'client',
		});
	}

	public exec(channel: GuildChannel): void {
		if (!channel.guild) return;
		const existing = this.client.settings.cache.reactions.filter(r => r.channelID === channel.id);
		if (!existing.size) return;
		for (const c of existing.values()) {
			this.client.settings.set('reaction', { id: c.id }, { active: false });
		}
	}
}

import { Listener } from 'discord-akairo';
import { GuildChannel } from 'discord.js';
import { In } from 'typeorm';
import { Reaction } from '../../../database';

export default class ChannelDeleteListener extends Listener {
	public constructor() {
		super('channelDelete', {
			emitter: 'client',
			event: 'channelDelete',
			category: 'client',
		});
	}

	public async exec(channel: GuildChannel): Promise<void> {
		if (!channel.guild) return;
		const rows = await Reaction.find({ channelID: channel.id });
		if (rows.length) {
			Reaction.createQueryBuilder()
				.update()
				.set({ active: false })
				.where({ id: In(rows.map(r => r.id)) });
		}
	}
}

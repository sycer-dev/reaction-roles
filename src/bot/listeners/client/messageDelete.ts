import { Listener } from 'discord-akairo';
import { Message } from 'discord.js';
import { In } from 'typeorm';
import { Reaction } from '../../../database';

export default class MessageDeleteListener extends Listener {
	public constructor() {
		super('messageDelete', {
			emitter: 'client',
			event: 'messageDelete',
			category: 'client',
		});
	}

	public async exec(msg: Message): Promise<void> {
		const rows = await Reaction.find({ messageID: msg.id });
		if (rows.length) {
			Reaction.createQueryBuilder()
				.update()
				.set({ active: false })
				.where({ id: In(rows.map(r => r.id)) });
		}
	}
}

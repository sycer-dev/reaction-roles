import { Listener } from 'discord-akairo';
import { Role } from 'discord.js';
import { In } from 'typeorm';
import { Reaction } from '../../../database';

export default class RoleDelete extends Listener {
	public constructor() {
		super('roleDelete', {
			emitter: 'client',
			event: 'roleDelete',
			category: 'client',
		});
	}

	public async exec(role: Role): Promise<void> {
		const rows = await Reaction.find({ roleID: role.id });
		if (rows.length) {
			Reaction.createQueryBuilder()
				.update()
				.set({ active: false })
				.where({ id: In(rows.map(r => r.id)) });
		}
	}
}

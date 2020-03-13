import { Listener } from 'discord-akairo';
import { Role } from 'discord.js';

export default class RoleDelete extends Listener {
	public constructor() {
		super('roleDelete', {
			emitter: 'client',
			event: 'roleDelete',
			category: 'client',
		});
	}

	public exec(role: Role): void {
		const existing = this.client.settings.cache.reactions.filter(r => r.roleID === role.id);
		for (const { _id } of existing.values()) this.client.settings.set('reaction', { _id }, { active: false });
	}
}

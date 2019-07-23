import { Listener } from 'discord-akairo';
import { Role } from 'discord.js';

export default class RoleDelete extends Listener {
	public constructor() {
		super('roleDelete', {
			emitter: 'client',
			event: 'roleDelete',
			category: 'client'
		});
	}

	public exec(role: Role): void {
		const existing = this.client.settings!.reaction.filter(r => r.roleID === role.id);
		if (!existing.size) return;
		for (const c of existing.values()) {
			this.client.settings!.set('reaction', { id: c.id }, { active: false });
		}
	}
}

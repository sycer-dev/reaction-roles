import { Listener } from 'discord-akairo';
import { User, MessageReaction, Permissions } from 'discord.js';
import { stripIndents } from 'common-tags';

export default class MessageReactionRemove extends Listener {
	public queue: Set<string> = new Set();

	public constructor() {
		super('messageReactionRemove', {
			emitter: 'client',
			event: 'messageReactionRemove',
			category: 'client',
		});
	}

	public async exec(reaction: MessageReaction, user: User): Promise<boolean | void> {
		let msg = reaction.message;
		if (msg.partial) msg = await msg.fetch();

		// ignore a message reaction that isn't a guild
		if (!msg.guild) return;

		// fetch our ME because it can be uncached
		if (!msg.guild.me || msg.guild.me.partial) await msg.guild.members.fetch(this.client.user?.id!);

		// get all of our message reactions with the message ID of our message. If none, return.
		const messages = this.client.settings.cache.reactions.filter(r => r.messageID === msg.id);
		if (!messages || !messages.size) return;

		const rr = messages.find(r => [reaction.emoji.name, reaction.emoji.id].includes(r.emoji));
		if (!rr || !rr.active) return;

		// fetch the role store because it may be uncached
		const role = await msg.guild.roles.fetch(rr.roleID).catch(() => undefined);
		if (!role) return;

		// check if we have permissions to manage roles
		if (!msg.guild.me!.permissions.has(Permissions.FLAGS.MANAGE_ROLES)) return;

		// check if we have the permissions to apply that specific role
		if (role.comparePositionTo(msg.guild.me!.roles.highest) >= 0) return;

		const member = await msg.guild.members.fetch(user).catch(() => undefined);
		if (!member || !member.roles.cache.has(role.id)) return;

		try {
			await member.roles.remove(role);
			await member.send(stripIndents`
				The **${role.name}** role has been removed from you in ${msg.guild.name}.
				
				Please Note: You must wait 5 seconds before you can re-react to have **${role.name}** reinstated.
			`);
		} catch {}
	}
}

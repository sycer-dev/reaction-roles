import { Listener } from 'discord-akairo';
import { User, MessageReaction, Permissions } from 'discord.js';
import { stripIndents } from 'common-tags';

export default class ReactionAddListener extends Listener {
	public queue: Set<string> = new Set();

	public constructor() {
		super('messageReactionAdd', {
			emitter: 'client',
			event: 'messageReactionAdd',
			category: 'client',
		});
	}

	public async exec(reaction: MessageReaction, user: User): Promise<boolean | void> {
		let msg = reaction.message;
		if (msg.partial) msg = await msg.fetch();

		// ignore a message reaction that isn't a guild
		if (!msg.guild) return;

		const key = `${reaction.emoji.toString()}:${user.id}`;
		if (this.queue.has(key)) return;
		this.queue.add(key);

		// fetch our ME because it can be uncached
		if (!msg.guild.me) await msg.guild.members.fetch(this.client.user?.id!);

		// get all of our message reactions with the message ID of our message. If none, return.
		const messages = this.client.settings.reaction.filter(r => r.messageID === msg.id);
		if (!messages.size) return this.queue.delete(key);

		const rr = messages.find(r => [reaction.emoji.name, reaction.emoji.id].includes(r.emoji));
		if (!rr || !rr.active) return this.queue.delete(key);

		// fetch the role store because it may be uncached
		const role = await msg.guild.roles.fetch(rr.roleID).catch(() => undefined);
		if (!role) return this.queue.delete(key);

		// check if we have permissions to manage roles
		if (!msg.guild.me?.permissions.has(Permissions.FLAGS.MANAGE_ROLES)) return this.queue.delete(key);

		// check if we have the permissions to apply that specific role
		if (role.comparePositionTo(msg.guild.me.roles.highest) >= 0) return this.queue.delete(key);

		const member = await msg.guild.members.fetch(user).catch(() => undefined);
		if (!member) return this.queue.delete(key);

		try {
			await member.roles.add(role);
			await member.send(stripIndents`
				You've been given the **${role.name}** role in ${msg.guild.name}.

				Please Note: You must wait 5 seconds before you can un-react to have me remove ${role.name}.
			`);
		} catch (err) {
			this.client.logger.info(`[ADDROLE ERROR]: ${err}.`);
		}

		// remove the user from the queue system in 2500 seconds so they can't spam reactions
		setTimeout(() => {
			this.queue.delete(key);
		}, 2500);
	}
}

import { Listener } from 'discord-akairo';
import { User, MessageReaction } from 'discord.js';

export default class MessageReactionRemove extends Listener {
	public queue: Set<string>;

	public constructor() {
		super('messageReactionRemove', {
			emitter: 'client',
			event: 'messageReactionRemove',
			category: 'client'
		});

		this.queue = new Set();
	}

	public async exec(reaction: MessageReaction, user: User): Promise<boolean | undefined> {
		const msg = reaction.message;
		if (msg.partial) await msg.fetch();

		// ignore a message reaction that isn't a guild
		if (!msg.guild) return;

		// fetch our ME because it can be uncached
		if (msg.guild.me!.partial) await msg.guild.members.fetch();

		// get all of our message reactions with the message ID of our message. If none, return.
		const messages = this.client.settings!.reaction.filter(r => r.messageID === msg.id);
		if (!messages || !messages.size) return

		const rr = messages.find(r => reaction.emoji.id === r.emoji || reaction.emoji.name === r.emoji);
		if (!rr || !rr.active) return

		// fetch the role store because it may be uncached
		const roles = await msg.guild.roles.fetch();
		const role = roles.get(rr.roleID);
		if (!role) return

		// check if we have permissions to manage roles
		if (!msg.guild.me!.permissions.has('MANAGE_ROLES')) return

		// check if we have the permissions to apply that specific role
		if (role.comparePositionTo(msg.guild.me!.roles.highest) >= 0) return

		const member = await msg.guild.members.fetch(user);
		if (!member) return
		if (!member.roles.has(role.id)) return;

		try {
			await member.roles.remove(role);
			await member.send(`The **${role.name}** role has been removed from you in ${msg.guild.name}.`);
		} catch (err) {
			this.client.logger.info(`[DELROLE ERROR]: ${err}.`);
		}
	}
}

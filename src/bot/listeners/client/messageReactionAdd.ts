import { stripIndents } from 'common-tags';
import { Listener } from 'discord-akairo';
import { MessageReaction, Permissions, User } from 'discord.js';
import { Reaction } from '../../../database';

export default class ReactionAddListener extends Listener {
	public constructor() {
		super('messageReactionAdd', {
			emitter: 'client',
			event: 'messageReactionAdd',
			category: 'client',
		});
	}

	private _delete(key: string): void {
		void this.client.redis.del(key);
	}

	public async exec(reaction: MessageReaction, user: User): Promise<boolean | void> {
		const queue = this.client.redis;

		let msg = reaction.message;
		if (msg.partial) msg = await msg.fetch();

		// ignore a message reaction that isn't a guild
		if (!msg.guild) return;

		const key = Buffer.from(`${reaction.emoji.toString()}:${user.id}`).toString('hex');
		if (await queue.get(key)) return;
		queue.set(key, key, 'PX', 3000);
		const delkey = () => this._delete(key);

		// fetch our ME because it can be uncached
		if (!msg.guild.me) await msg.guild.members.fetch(this.client.user?.id!);

		// get all of our message reactions with the message ID of our message. If none, return.
		const messages = await Reaction.find({ messageID: msg.id });
		if (!messages.length) return delkey();

		const rr = messages.find(r => [reaction.emoji.name, reaction.emoji.id].includes(r.emoji));
		if (!rr || !rr.active) return delkey();

		// fetch the role store because it may be uncached
		const role = await msg.guild.roles.fetch(rr.roleID).catch(() => undefined);
		if (!role) return delkey();

		// check if we have permissions to manage roles
		if (!msg.guild.me?.permissions.has(Permissions.FLAGS.MANAGE_ROLES)) return delkey();

		// check if we have the permissions to apply that specific role
		if (role.comparePositionTo(msg.guild.me.roles.highest) >= 0) return delkey();

		const member = await msg.guild.members.fetch(user).catch(() => undefined);
		if (!member) return delkey();

		try {
			await member.roles.add(role);
			await member.send(stripIndents`
				You've been given the **${role.name}** role in ${msg.guild.name}.
				Please Note: You must wait 5 seconds before you can un-react to have me remove ${role.name}.
			`);
		} catch (err) {
			this.client.logger.info(`[ADDROLE ERROR]: ${err}.`);
		}
	}
}

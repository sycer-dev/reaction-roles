import { Command } from "../../structures/commands/Command";
import { ParserOutput } from "lexure";
import { Permissions } from '@spectacles/util';
import { APIMessageData } from "@klasa/dapi-types";
import { createReactionRole } from '../../util/gql';

export default class extends Command {
	public constructor() {
		super('create', {
			aliases: ['create', 'new', 'add'],
			parseArgs: true,
			category: 'utilities',
			meta: {
				description: 'Creates a new reaction role on an existing message.',
				usage: '<channel> <role> <message ID> <emoji>',
				examples: ['#reaction-roles @USA 725789211516469250 🍔', '#welcome 581634305332084872 725790792962015273 ❓'],
			},
			clientPermissions: [Command.Permissions.FLAGS.SEND_MESSAGES, Command.Permissions.FLAGS.EMBED_LINKS, Command.Permissions.FLAGS.MANAGE_MESSAGES],
			userPermissions: [Command.Permissions.FLAGS.MANAGE_ROLES]
		});
	}

	public async run(msg: APIMessageData, args: ParserOutput): Promise<void> {
		const [_channel, _role, _msg, _emoji] = args.ordered;
		if (!_channel || !_role || !_msg) {
			const missing = !_channel ? 'channel' : !_role ? 'role ' : 'message ID';

			return void this.client.util.sendMessage(msg.channel_id, { content: `Command exited - missing argument \`${missing}\`.` });
		}

		const channel = await this.client.util.parseChannel(_channel.value);
		if (!channel) {
			return void this.client.util.sendMessage(msg.channel_id, { content: `Command exited - a channel with the query \`${_channel.value}\` could not be found.` });
		}

		const role = await this.client.util.parseRole(_role.value, msg.guild_id!);
		if (!role) {
			return void this.client.util.sendMessage(msg.channel_id, { content: `Command exited - a role with the query \`${_role.value}\` could not be found.` });
		}

		let message: APIMessageData | undefined = undefined;

		try {
			message = await this.client.util.fetchMessage(channel.id, _msg.value);
		} catch {
			return void this.client.util.sendMessage(msg.channel_id, { content: `Command exited - a message with the ID of \`${_msg.value}\` was not found in <#${channel.id}>.` });
		}

		const emoji = this.client.util.parseEmoji(_emoji.value);
		if (!emoji) {
			return void this.client.util.sendMessage(msg.channel_id, { content: `Command exited - the emoji \`${_emoji.value}\` was not found. Please ensure I'm in the same server the emoji is from!` });
		}

		const mePerms = new Command.Permissions();
		const guild = await this.client.util.fetchGuild(msg.guild_id!);
		const me = await this.client.util.fetchMember(guild!.id, this.client.user!.id);
		mePerms.apply({ guild, channel, member: me });

		const necessary = new Permissions(Permissions.FLAGS.VIEW_CHANNEL).add(Permissions.FLAGS.ADD_REACTIONS).add(Permissions.FLAGS.READ_MESSAGE_HISTORY);
		if (!mePerms.has(necessary.bitfield)) {
			return void this.client.util.sendMessage(msg.channel_id, { content: `Command exited - please ensure I have the permissions \`View Channel\`, \`Add Reactions\` and \`Read Message History\` in <#${channel.id}>.` });
		}

		try {
			await this.client.util.addReaction(channel.id, message.id, emoji);
		} catch {}

		const match = /a?:[a-zA-Z0-9_]+:(\d{17,19})/.exec(emoji);
		const dbEmoji = match ? match[1] : emoji;

		await createReactionRole({
			guild_id: msg.guild_id!,
			channel_id: channel.id,
			message_id: message.id,
			role_id: role.id,
			emoji: dbEmoji,
			created_by: msg.author.id,
		});

		return void this.client.util.sendMessage(msg.channel_id, { content: `Successfully created a reaction role in <#${channel.id}> for the role \`${role.name}\` bound to the emoji ${_emoji.value}.`});
	}
}
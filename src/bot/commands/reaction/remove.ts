import { Command } from 'discord-akairo';
import { Message, TextChannel } from 'discord.js';
import { Reaction } from '../../../database/models/Reaction';

export default class RemoveCommand extends Command {
	public constructor() {
		super('remove', {
			aliases: ['delete', 'remove', 'del', 'rm'],
			category: 'Reaction Roles',
			channel: 'guild',
			description: {
				content: 'Removes a reaction from a message via an identifier.',
				usage: '<identifier>',
			},
			userPermissions: ['MANAGE_ROLES'],
			args: [
				{
					id: 'reaction',
					type: (msg: Message, str: string): Reaction | null => {
						const req = this.client.settings.cache.reactions.find(r => r.id === str && r.guildID === msg.guild!.id);
						if (!req) return null;
						return req;
					},
					match: 'rest',
					prompt: {
						start: "Pleae provied the unique identifier for the reaction you'd like to delete.",
						retry:
							"Please provide a valid identifier for the reaction role you'd like to delete. You can also delete the whole message to delete reaction roles on it.",
					},
				},
			],
		});
	}

	public async exec(msg: Message, { reaction }: { reaction: Reaction }): Promise<Message | Message[]> {
		this.client.logger.info(reaction);
		try {
			const chan = this.client.channels.cache.get(reaction.channelID) as TextChannel;
			if (!chan) throw new Error("That channel doesn't exist!");
			const message = await chan.messages.fetch(reaction.messageID);
			if (!message) throw new Error("That message doesn't exist!");
			await message.reactions.cache.get(reaction.emoji)!.users.remove(this.client.user!.id);
		} catch (err) {
			this.client.logger.error(`[ERROR in REMOVE CMD]: ${err}.`);
		}

		this.client.settings.set(
			'reaction',
			{ messageID: reaction.messageID },
			{
				active: false,
			},
		);

		return msg.util!.reply('successfully deleted that reaction role.');
	}
}

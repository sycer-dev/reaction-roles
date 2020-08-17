import { Command } from 'discord-akairo';
import { Message, TextChannel } from 'discord.js';
import { Reaction } from '../../../database';

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
					type: async (msg: Message, str: string): Promise<Reaction | null> => {
						const row = await Reaction.findOne({ id: parseInt(str, 10), guildID: msg.guild!.id, active: true });
						return row ?? null;
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

	public async exec(msg: Message, { reaction }: { reaction: Reaction }): Promise<Message | Message[] | void> {
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

		reaction.active = false;
		await reaction.save();

		return msg.util?.reply('successfully deleted that reaction role.');
	}
}

import { Command } from 'discord-akairo';
import { Message } from 'discord.js';

export default class VoteCommand extends Command {
	public constructor() {
		super('vote', {
			aliases: ['vote', 'premium'],
			clientPermissions: ['SEND_MESSAGES'],
			description: {
				content: 'Gives information about where you can recieve premium beneifts.',
			},
			category: 'Utilities',
		});
	}

	public async exec(msg: Message): Promise<Message | Message[] | void> {
		return msg.util?.reply('Soon™.');
	}
}

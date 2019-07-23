import { Command } from 'discord-akairo';
import { Message } from 'discord.js';

export default class PingCommand extends Command {
	public constructor() {
		super('ping', {
			aliases: ['ping', 'latency', 'test'],
			clientPermissions: ['SEND_MESSAGES'],
			description: {
				content: 'Checks the bot\'s ping to Discord.'
			},
			category: 'Utilities'
		});
	}

	public async exec(msg: Message): Promise<Message | Message[]> {
		const message = await msg.util!.send('Ping?') as Message;
		const ping = Math.round(message.createdTimestamp - msg.createdTimestamp);
		return message.edit(`Pong! \`${ping}ms\``);
	}
}


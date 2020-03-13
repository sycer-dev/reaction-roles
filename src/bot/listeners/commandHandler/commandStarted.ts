import { Listener, Command } from 'discord-akairo';
import { Message } from 'discord.js';

export default class CommandStartedListener extends Listener {
	public constructor() {
		super('commandStarted', {
			emitter: 'commandHandler',
			event: 'commandStarted',
			category: 'commandHandler',
		});
	}

	public exec(msg: Message, command: Command): void {
		if (msg.util!.parsed!.command) return;
		const where = msg.guild ? msg.guild.name : msg.author.tag;
		this.client.logger.info(`[COMMAND STARTED] ${command.id} in ${where}`);
	}
}

import { Listener } from 'discord-akairo';
import { Message, TextChannel } from 'discord.js';

export default class ErrorHandler extends Listener {
	public constructor() {
		super('error', {
			emitter: 'commandHandler',
			event: 'error',
			category: 'commandHandler'
		});
	}

	public exec(err: Error, msg: Message): undefined | Promise<Message | Message[]> {
		this.client.logger.error(`[COMMAND ERROR] ${err} ${err.stack}`);
		if (msg.guild && msg.channel instanceof TextChannel && msg.channel!.permissionsFor(this.client.user!)!.has('SEND_MESSAGES')) {
			return msg.channel.send([
				'Looks like an error occured.',
				'```js',
				`${err}`,
				'```'
			]);
		}
	}
}

import { Listener, Command } from 'discord-akairo';
import { Message, TextChannel } from 'discord.js';

export default class CommandBlockedListener extends Listener {
	public constructor() {
		super('commandBlocked', {
			event: 'commandBlocked',
			emitter: 'commandHandler',
			category: 'commandHandler',
		});
	}

	public async exec(msg: Message, command: Command, reason: string): Promise<Message | Message[] | void> {
		if (reason === 'sendMessages') return;

		const text = {
			owner: 'You must be the owner to use this command.',
			guild: 'You must be in a guild to use this command.',
			dm: 'This command must be ran in DMs.',
		} as { [key: string]: string };

		const location = msg.guild ? msg.guild.name : msg.author.tag;
		this.client.logger.info(`[COMMANDS BLOCKED] ${command.id} with reason ${reason} in ${location}`);

		const res = text[reason];
		if (!res) return;

		if (
			msg.guild &&
			msg.channel instanceof TextChannel &&
			msg.channel.permissionsFor(this.client.user!)!.has('SEND_MESSAGES')
		) {
			return msg.util!.reply(res);
		}
	}
}

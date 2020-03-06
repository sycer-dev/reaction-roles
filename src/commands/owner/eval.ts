import { Command } from 'discord-akairo';
import { Message } from 'discord.js';
import { inspect } from 'util';

export default class EvalCommand extends Command {
	public constructor() {
		super('eval', {
			category: 'owner',
			aliases: ['eval', 'js', 'e'],
			args: [
				{
					id: 'code',
					match: 'content',
					prompt: {
						start: 'what code would you like to evaluate?',
					},
				},
			],
			clientPermissions: ['SEND_MESSAGES'],
			description: 'Evaluate JavaScript code.',
			ownerOnly: true,
		});
	}

	public async exec(msg: Message, { code }: { code: string }): Promise<Message | Message[] | void> {
		let evaled;
		const start = Date.now();
		let type;
		try {
			// eslint-disable-next-line
			evaled = await eval(code); 
			type = typeof evaled;
			if (typeof evaled === 'object') {
				evaled = inspect(evaled, {
					depth: 0,
				});
			}
		} catch (err) {
			return msg.util?.send(['An error occured!', '```js', `${err}`, '```']);
		}
		const end = Date.now();
		if (!evaled) {
			evaled = 'Nothing...';
		}
		if (evaled.length > 1500) {
			evaled = 'Response too long.';
		}
		return msg.util?.send([
			'**Output**:',
			'```js',
			`${evaled}`,
			'```',
			'**Type**:',
			'```js',
			`${type}`,
			'```',
			`⏱ ${end - start}ms`,
		]);
	}
}

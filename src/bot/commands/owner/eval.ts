// https://github.com/almostSouji/cor/blob/master/src/bot/commands/owner/eval.ts
import { execSync } from 'child_process';
import { Command } from 'discord-akairo';
import { Message } from 'discord.js';
import util from 'util';
import { postHaste } from '../../util';
import { MESSAGES, SENSITIVE_PATTERN_REPLACEMENT } from '../../util/constants';

export default class EvalCommand extends Command {
	public constructor() {
		super('eval', {
			category: 'owner',
			aliases: ['eval', 'js', 'e'],
			clientPermissions: ['SEND_MESSAGES'],
			description: {
				content: 'Evaluate JavaScript code.',
			},
			ownerOnly: true,
			args: [
				{
					id: 'code',
					match: 'text',
					prompt: {
						start: 'what code would you like to evaluate?',
					},
				},
				{
					id: 'terminal',
					flag: ['--t'],
					match: 'flag',
				},
				{
					id: 'input',
					match: 'flag',
					flag: ['--input', '--in', '--i'],
				},
				{
					id: 'noout',
					match: 'flag',
					flag: ['--noout', '--nout', '--no'],
				},
				{
					id: 'notype',
					match: 'flag',
					flag: ['--notype', '--notp'],
				},
				{
					id: 'notime',
					match: 'flag',
					flag: ['--notime', '--noti'],
				},
				{
					id: 'haste',
					match: 'flag',
					flag: ['--haste', '--h'],
				},
			],
		});
	}

	private _clean(text: any): any {
		if (typeof text === 'string') {
			text = text.replace(/`/g, `\`${String.fromCharCode(8203)}`).replace(/@/g, `@${String.fromCharCode(8203)}`);

			return text.replace(new RegExp(this.client.token!, 'gi'), SENSITIVE_PATTERN_REPLACEMENT);
		}

		return text;
	}

	public async exec(
		msg: Message,
		{
			code,
			terminal,
			input,
			noout,
			notype,
			notime,
			haste,
		}: {
			code: string;
			terminal: boolean;
			input: boolean;
			noout: boolean;
			notype: boolean;
			notime: boolean;
			haste: boolean;
		},
	): Promise<Message | Message[] | void> {
		if (terminal) {
			try {
				const exec = execSync(code).toString();
				return msg.util!.send(exec.substring(0, 1900), { code: 'fix' });
			} catch (err) {
				return msg.util!.send(err.toString(), { code: 'fix' });
			}
		}

		let evaled;
		try {
			const hrStart = process.hrtime();
			evaled = eval(code); // eslint-disable-line no-eval

			// eslint-disable-next-line
			if (evaled != null && typeof evaled.then === 'function') evaled = await evaled;
			const hrStop = process.hrtime(hrStart);

			let response = '';
			if (input) {
				response += MESSAGES.COMMANDS.EVAL.INPUT(code);
			}
			if (!noout) {
				response += MESSAGES.COMMANDS.EVAL.OUTPUT(this._clean(util.inspect(evaled, { depth: 0 })));
			}
			if (!notype && !noout) {
				response += `• Type: \`${typeof evaled}\``;
			}
			if (!noout && !notime) {
				response += ` • time taken: \`${(hrStop[0] * 1e9 + hrStop[1]) / 1e6}ms\``;
			}
			if (haste) {
				const hasteLink = await postHaste(this._clean(util.inspect(evaled)), 'js');
				response += `\n• Full Inspect: ${hasteLink}`;
			}
			if (response.length > 20000) {
				try {
					const hasteLink = await postHaste(this._clean(util.inspect(evaled)));
					return msg.util?.send(MESSAGES.COMMANDS.EVAL.LONG_OUTPUT(hasteLink));
				} catch (hasteerror) {
					return msg.util?.send(MESSAGES.COMMANDS.EVAL.ERRORS.TOO_LONG);
				}
			}
			if (response.length > 0) {
				await msg.util?.send(response);
			}
		} catch (err) {
			this.client.logger.error('[EVAL ERROR]', err.stack);
			return msg.util?.send(MESSAGES.COMMANDS.EVAL.ERRORS.CODE_BLOCK(this._clean(err)));
		}
	}
}

import Handler, { Modules } from '../core/Handler';
import { Command } from './Command';
import * as Lexure from 'lexure';
import { APIMessageData } from '@klasa/dapi-types';

export type CommandConstructor<T> = new (...args: ConstructorParameters<typeof Command>) => T;

export default class CommandHandler extends Handler<Command> {
	public readonly prefix = 'rr!';

	public async handle(msg: APIMessageData): Promise<void> {
		const lexer = new Lexure.Lexer(msg.content).setQuotes([
			['"', '"'],
			['“', '”'],
		]);

		const tokens = lexer.lex();
		const cmdToken = Lexure.extractCommand(s => (s.startsWith(this.prefix) ? this.prefix.length : null), tokens);
		if (!cmdToken) return;

		const command = this.modules.find(m => m.aliases.some(a => a.toLowerCase() === cmdToken.value.toLowerCase()));
		if (!command) return;

		// can just run now if no arguments are needed
		if (!command.parseArgs) {
			try {
				await command.run(msg);
			} catch (err) {
				this.client.logger.error(`[COMMAND ERROR]: ${err}`);
			}
			return;
		}

		const parser = new Lexure.Parser(tokens).setUnorderedStrategy(Lexure.longStrategy());
		const res = parser.parse();
		const args = Lexure.outputToJSON(res);

		try {
			await command.run(msg, args);
		} catch {}
	}

	public async loadAll(): Promise<Modules<Command>> {
		const files = await this.walk();

		for (const file of files) {
			const _raw = await import(file);
			const imported = 'default' in _raw ? _raw.default : _raw;
			const command: Command = new imported();
			command.client = this.client;

			// handle aliases
			for (const alias of command.aliases) {
				const conflicting = this.modules.get(alias);
				if (conflicting)
					throw Error(`[COMMAND:DUPLICATE_ALIAS] Alias "${alias}" already exists on command "${conflicting.id}"`);
				this.modules.set(command.id, command);
			}
		}

		return this.modules;
	}
}

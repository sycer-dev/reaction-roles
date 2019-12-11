import { join } from 'path';
import { AkairoClient, CommandHandler, InhibitorHandler, ListenerHandler } from 'discord-akairo';
import { Message } from 'discord.js';
import { Logger, createLogger, transports, format } from 'winston';
import SettingsProvider from './SettingsProvider';
import { LoggerConfig } from '../util/LoggerConfig';

declare module 'discord-akairo' {
	interface AkairoClient {
		logger: Logger;
		commandHandler: CommandHandler;
		config: ReactionConfig;
		settings: SettingsProvider;
	}
}

export interface ReactionConfig {
	token: string;
	color: string;
	ownerID: string | string[];
	prefix: string;
}

export default class ReactionClient extends AkairoClient {
	public constructor(public config: ReactionConfig) {
		super({
			messageCacheMaxSize: 100,
			ownerID: config.ownerID,
			disabledEvents: ['TYPING_START'],
			shardCount: 'auto',
			partials: ['MESSAGE']
		});

		this.config = config;

		this
			.on('shardError', (err: Error, id: any): Logger => this.logger.error(`[SHARD ${id} ERROR] ${err.message}`, err.stack))
			.on('warn', (warn: any): Logger => this.logger.warn(`[CLIENT WARN] ${warn}`));
	}

	public logger: Logger = createLogger({
		levels: LoggerConfig.levels,
		format: format.combine(
			format.colorize({ level: true }),
			format.errors({ stack: true }),
			format.splat(),
			format.timestamp({ format: 'MM/DD/YYYY HH:mm:ss' }),
			format.printf((data: any) => {
				const { timestamp, level, message, ...rest } = data;
				return `[${timestamp}] ${level}: ${message}${Object.keys(rest).length ? `\n${JSON.stringify(rest, null, 2)}` : ''}`;
			}),
		),
		transports: new transports.Console(),
		level: 'custom',
	});

	public commandHandler: CommandHandler = new CommandHandler(this, {
		directory: join(__dirname, '..', 'commands'),
		prefix: async (msg: Message): Promise<string> => {
			if (!msg.guild) return this.config.prefix;
			const doc = this.settings!.guild.find(g => g.id === msg.guild!.id);
			if (!doc || !doc['prefix']) return this.config.prefix;
			return doc.prefix!;
		},
		aliasReplacement: /-/g,
		allowMention: true,
		handleEdits: true,
		commandUtil: true,
		commandUtilLifetime: 3e5,
		defaultCooldown: 3000,
		ignorePermissions: this.ownerID,
		argumentDefaults: {
			prompt: {
				modifyStart: (msg: Message, str: string) => `${msg.author}, ${str}\n...or type \`cancel\` to cancel this command.`,
				modifyRetry: (msg: Message, str: string) => `${msg.author}, ${str}\n...or type \`cancel\` to cancel this command.`,
				timeout: 'You took too long! This command has been cancelled.',
				ended: 'Too many tries. *tsk tsk* This command has been cancelled.',
				cancel: 'If you say so. Command cancelled.',
				retries: 3,
				time: 30000
			},
			otherwise: ''
		}
	});

	public inhibitorHandler: InhibitorHandler = new InhibitorHandler(this, { directory: join(__dirname, '..', 'inhibitors') });

	public listenerHandler: ListenerHandler = new ListenerHandler(this, { directory: join(__dirname, '..', 'listeners') });

	public settings: SettingsProvider = new SettingsProvider(this); 

	private async load(): Promise<void> {
		await this.settings.init();
		this.commandHandler.useInhibitorHandler(this.inhibitorHandler);
		this.commandHandler.useListenerHandler(this.listenerHandler);
		this.listenerHandler.setEmitters({
			commandHandler: this.commandHandler,
			inhibitorHandler: this.inhibitorHandler,
			listenerHandler: this.listenerHandler
		});
		this.commandHandler.loadAll();
		this.inhibitorHandler.loadAll();
		this.listenerHandler.loadAll();
	}

	public async launch(): Promise<string> {
		await this.load();
		return this.login(this.config.token);
	}
}

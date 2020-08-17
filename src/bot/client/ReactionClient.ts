import { AkairoClient, CommandHandler, InhibitorHandler, ListenerHandler } from 'discord-akairo';
import { ColorResolvable, Message } from 'discord.js';
import { join } from 'path';
import { Logger } from 'winston';
import { SettingsProvider } from '../../database';
import { logger } from '../util/logger';
import Redis from 'ioredis';

declare module 'discord-akairo' {
	interface AkairoClient {
		logger: Logger;
		commandHandler: CommandHandler;
		listenerHandler: ListenerHandler;
		config: ReactionConfig;
		settings: SettingsProvider;
		redis: Redis.Redis;
	}
}

export interface ReactionConfig {
	token: string;
	color: ColorResolvable;
	owners: string | string[];
	prefix: string;
}

export default class ReactionClient extends AkairoClient {
	public constructor(config: ReactionConfig) {
		super({
			messageCacheMaxSize: 50,
			messageCacheLifetime: 300,
			messageSweepInterval: 900,
			ownerID: config.owners,
			partials: ['MESSAGE', 'REACTION'],
		});

		this.config = config;

		this.on(
			'shardError',
			(err: Error, id: any): Logger => this.logger.error(`[SHARD ${id} ERROR] ${err.message}`, err.stack),
		).on('warn', (warn: any): Logger => this.logger.warn(`[CLIENT WARN] ${warn}`));
	}

	public readonly config: ReactionConfig;

	public logger = logger;

	public commandHandler: CommandHandler = new CommandHandler(this, {
		directory: join(__dirname, '..', 'commands'),
		prefix: async (msg: Message): Promise<string> => {
			if (msg.guild) {
				const row = await this.settings.guild(msg.guild.id);
				if (row?.prefix) return row.prefix;
			}
			return this.config.prefix;
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
				modifyStart: (msg: Message, str: string) =>
					`${msg.author}, ${str}\n...or type \`cancel\` to cancel this command.`,
				modifyRetry: (msg: Message, str: string) =>
					`${msg.author}, ${str}\n...or type \`cancel\` to cancel this command.`,
				timeout: 'You took too long! This command has been cancelled.',
				ended: 'Too many tries. *tsk tsk* This command has been cancelled.',
				cancel: 'If you say so. Command cancelled.',
				retries: 3,
				time: 30000,
			},
			otherwise: '',
		},
	});

	public inhibitorHandler: InhibitorHandler = new InhibitorHandler(this, {
		directory: join(__dirname, '..', 'inhibitors'),
	});

	public listenerHandler: ListenerHandler = new ListenerHandler(this, {
		directory: join(__dirname, '..', 'listeners'),
	});

	public settings: SettingsProvider = new SettingsProvider(this);

	public readonly redis: Redis.Redis = new Redis(process.env.REDIS_URL);

	private async load(): Promise<this> {
		await this.settings.init();
		this.commandHandler.useInhibitorHandler(this.inhibitorHandler);
		this.commandHandler.useListenerHandler(this.listenerHandler);
		this.listenerHandler.setEmitters({
			commandHandler: this.commandHandler,
			inhibitorHandler: this.inhibitorHandler,
			listenerHandler: this.listenerHandler,
		});
		this.commandHandler.loadAll();
		this.inhibitorHandler.loadAll();
		this.listenerHandler.loadAll();
		return this;
	}

	public async launch(): Promise<string> {
		await this.load();
		return this.login(this.config.token);
	}
}

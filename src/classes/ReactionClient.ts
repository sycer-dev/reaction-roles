import { AkairoClient, CommandHandler, InhibitorHandler, ListenerHandler } from 'discord-akairo';
import { ColorResolvable, Message, Constants } from 'discord.js';
import { join } from 'path';
import { Logger } from 'winston';
import { logger } from '../util/logger';
import SettingsProvider from './SettingsProvider';

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
	color: ColorResolvable;
	owners: string | string[];
	prefix: string;
}

export default class ReactionClient extends AkairoClient {
	public constructor(public config: ReactionConfig) {
		super({
			messageCacheMaxSize: 50,
			messageCacheLifetime: 300,
			messageSweepInterval: 900,
			ownerID: config.owners,
			partials: [Constants.PartialTypes.REACTION],
			// ws: {
			// 	intents: [
			// 		Intents.FLAGS.GUILDS,
			// 		Intents.FLAGS.GUILD_MEMBERS,
			// 		Intents.FLAGS.GUILD_MESSAGES,
			// 		Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
			// 		Intents.FLAGS.DIRECT_MESSAGES,
			// 	],
			// },
		});

		this.config = config;
	}

	public logger: Logger = logger;

	public commandHandler: CommandHandler = new CommandHandler(this, {
		directory: join(__dirname, '..', 'commands'),
		prefix: (msg: Message): string => {
			if (msg.guild) {
				const req = this.settings.guild.get(msg.guild.id);
				if (req) return req.prefix;
			}
			return 'r!';
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

	private async load(): Promise<void> {
		await this.settings.init();
		this.commandHandler.useInhibitorHandler(this.inhibitorHandler);
		this.commandHandler.useListenerHandler(this.listenerHandler);
		this.listenerHandler.setEmitters({
			commandHandler: this.commandHandler,
			inhibitorHandler: this.inhibitorHandler,
			listenerHandler: this.listenerHandler,
			shard: this,
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

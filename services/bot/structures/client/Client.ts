import { APIUserData } from '@klasa/dapi-types';
import { Amqp } from '@spectacles/brokers';
import Rest, { RedisMutex } from '@spectacles/rest';
import { join } from 'path';
import { WebSocketEvents } from '../../util/constants';
import { logger } from '../../util/logger';
import { redis } from '../../util/redis';
import CommandHandler from '../commands/CommandHandler';
import ListenerHandler from '../listeners/ListenerHandler';
import ClientUtil from './ClientUtil';

export default class Client {
	/**
	 * the RabbitMQ broker
	 */
	public readonly broker = new Amqp('gateway');

	/**
	 * the command handler
	 */
	public readonly commandHandler: CommandHandler = new CommandHandler(this, join(__dirname, '..', '..', 'commands'));

	/**
	 * the listener handler
	 */
	public readonly listenerHandler: ListenerHandler = new ListenerHandler(
		this,
		join(__dirname, '..', '..', 'listeners'),
	);

	/**
	 * the logger
	 */
	public readonly logger = logger;

	/**
	 * the Redis connection
	 */
	public readonly redis = redis;

	/**
	 * the discord rest interface
	 */
	public readonly rest = new Rest({
		token: process.env.DISCORD_TOKEN,
		mutex: new RedisMutex(redis),
	});

	public user?: APIUserData;

	public readonly util: ClientUtil = new ClientUtil(this);

	public async launch() {
		// load all the commands and listeners
		this.logger.debug(`[COMMAND HANDLER]: Loading all commands...`);
		await this.commandHandler.loadAll();
		this.logger.info(`[COMMAND HANDLER]: Loaded ${this.commandHandler.modules.size} commands!`);
		await this.listenerHandler.loadAll();

		// to prevent providing the same event multiple times
		const events: Set<string> = new Set();
		// added manually for the command handler
		events.add(WebSocketEvents.MessageCreate);

		for (const listener of this.listenerHandler.modules.values()) {
			events.add(listener.event);
		}

		for (const event of events.values()) {
			this.broker.on(event, (data, { ack }) => {
				ack();
				this.listenerHandler.handleEvent(event, data);
				if (event === WebSocketEvents.MessageCreate) this.commandHandler.handle(data);
			});
			this.logger.debug(`[RABBIT]: Created listener for event '${event}'.`);
		}

		// all the listeners are setup, we can connect now
		this.logger.debug(`[RABBIT]: Connecting to RabbitMQ...`);
		await this.broker.connect('fyko:doctordoctor@rabbit');
		this.logger.info(`[RABBIT]: Connected to Rabbit MQ!`);
		this.logger.debug(`[RABBIT]: Subscribing to ${events.size} events...`);
		await this.broker.subscribe(Array.from(events));
		this.logger.info(`[RABBIT]: Subscribed to ${events.size} events!`);

		this.user = await this.rest.get('/users/@me');
	}
}

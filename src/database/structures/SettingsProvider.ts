import { createConnection, Connection } from 'typeorm';
import { Logger } from 'winston';
import ReactionClient from '../../bot/client/ReactionClient';
import { Guild, Reaction } from '..';

/**
 * The Settings Provider that handles all database reads and rights.
 * @private
 */
export default class SettingsProvider {
	protected readonly client: ReactionClient;

	public connection!: Connection;

	public readonly entities = {
		guild: Guild,
		reaction: Reaction,
	};

	/**
	 *
	 * @param {GiveawayClient} client - The extended Akairo Client
	 */
	public constructor(client: ReactionClient) {
		this.client = client;
	}

	/**
	 * Connect to the database
	 * @param {string} url - the mongodb uri
	 * @returns {Promise<number | Logger>} Returns a
	 */
	private async _connect(): Promise<Logger | number> {
		const start = Date.now();
		try {
			this.connection = await createConnection();
		} catch (err) {
			this.client.logger.error(`[DATABASE] Error when connecting to Postgres:\n${err.stack}`);
			process.exit(1);
		}
		return this.client.logger.verbose(`[DATABASE] Connected to Postgres in ${Date.now() - start}ms.`);
	}

	public async guild(id: string): Promise<Guild> {
		const row = await Guild.findOne({ id });
		if (row) return row;
		return Guild.create({ id }).save();
	}

	/**
	 * Starts the Settings Provider
	 * @returns {SettingsProvider}
	 */
	public async init(): Promise<this> {
		await this._connect();

		return this;
	}
}

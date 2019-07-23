import ReactionClient from './ReactionClient';
import { Collection } from 'discord.js';
import { connect, Model } from 'mongoose';
import GuildModel, { Guild } from '../models/Guild';
import ReactionModel, { Reaction } from '../models/Reaction';
import { Logger } from 'winston';

let i = 0;

const MODELS = {
	guild: GuildModel,
	reaction: ReactionModel
};

export default class SettingsProvider {
	public client: ReactionClient;

	public guild: Collection<string, Guild>;

	public reaction: Collection<string, Reaction>;

	public GuildModel: Model<Guild>;

	public ReactionModel: Model<Reaction>;

	public constructor(client: ReactionClient) {
		/* our cient model */
		this.client = client;
		
		/* our document collections */
		this.guild = new Collection();
		this.reaction = new Collection();

		/* our models */
		this.GuildModel = GuildModel;
		this.ReactionModel = ReactionModel;
	}

	/* creates new model with provided data */
	public async new(type: 'guild' | 'reaction', data: object): Promise<Guild | Reaction | null> {
		const doc = new MODELS[type](data);
		this[type].set(doc.id, doc as any);
		// @ts-ignore
		await doc.save();
		return doc;
	}

	/* setting options of an existing document */
	public async set(type: 'guild' | 'reaction', data: object, key: object): Promise<Guild | Reaction | null> {
		const model = MODELS[type];
		const doc = await model.findOneAndUpdate(data, { $set: key }, { 'new': true });
		if (!doc) return null;
		this[type].set(doc.id, doc as any);
		return doc;
	}

	/* removes a document with the provider query */
	public async remove(type: 'guild' | 'reaction', data: any): Promise<Guild | Reaction | null> {
		const model = MODELS[type];
		const doc = await model.findOneAndDelete(data);
		if (!doc) return null;
		this[type].delete(doc!.id);
		return doc;
	}

	/* caching documents */
	public async cacheGuilds(): Promise<Logger> {
		const guilds = await this.GuildModel.find();
		for (const g of guilds) {
			this.guild.set(`${g.id}`, g);
			i++;
		}
		return this.client.logger.info(`[SETTINGS] Successfully cached ${guilds.length} Guild documents.`);
	}

	public async cacheReactions(): Promise<Logger> {
		const reactions = await this.ReactionModel.find();
		for (const r of reactions) {
			this.reaction.set(`${r.messageID}`, r);
			i++;
		}
		return this.client.logger.info(`[SETTINGS] Successfully cached ${reactions.length} Reaction documents.`);
	}

	public cacheAll(): void {
		this.cacheGuilds();
		this.cacheReactions();
	}

	/* connecting */
	private async connect(url: undefined | string): Promise<Logger | number> {
		if (url) {
			const start = Date.now();
			try {
				await connect(url, {
					useCreateIndex: true,
					useNewUrlParser: true,
					useFindAndModify: false
				});
			} catch (err) {
				this.client.logger.error(`[SETTINGS] Error when connecting to MongoDB:\n${err.stack}`);
				process.exit(1);
			}
			return this.client.logger.info(`[SETTINGS] Connected to MongoDB in ${Date.now() - start}ms.`);
		}
		this.client.logger.error('[SETTINGS] No MongoDB url provided!');
		return process.exit(1);
	}

	public async init(): Promise<Logger> {
		await this.connect(process.env.MONGO);
		this.cacheAll();
		return this.client.logger.info(`[SETTINGS] Successfully cached ${i} documents.`);
	}
}

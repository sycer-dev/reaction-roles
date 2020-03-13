import { Listener } from 'discord-akairo';
import { ActivityType, Guild } from 'discord.js';

export interface ReactionStatus {
	text: string;
	type: ActivityType;
}

export default class ReadyListener extends Listener {
	public constructor() {
		super('ready', {
			emitter: 'client',
			event: 'ready',
			category: 'client',
		});
	}

	public async exec(): Promise<void> {
		this.client.logger.info(`[READY] ${this.client.user?.tag} is ready.`);

		const activities: ReactionStatus[] = [
			{
				text: `${this.client.settings.cache.reactions.size} Reaction Roles 💪`,
				type: 'WATCHING',
			},
			{
				text: 'https://sycer.dev/ 🔗',
				type: 'WATCHING',
			},
			{
				text: `with ${this.client.guilds.cache.reduce((prev, val) => {
					return prev + val.memberCount;
				}, 0)} Users 👪`,
				type: 'PLAYING',
			},
			{
				text: `${this.client.guilds.cache.size.toLocaleString('en-US')} Guilds 🛡`,
				type: 'WATCHING',
			},
		];

		const statuses = this.infinite(activities);

		setInterval(() => {
			const status = statuses.next() as IteratorResult<ReactionStatus>;
			this.client.user!.setActivity(status.value.text, { type: status.value.type });
		}, 300000);

		setInterval(() => this._clearPresences(), 9e5);
	}

	private _clearPresences(): void {
		const i = this.client.guilds.cache.reduce((acc: number, g: Guild): number => {
			acc += g.presences.cache.size;
			g.presences.cache.clear();
			return acc;
		}, 0);
		this.client.emit('debug', `[PRESNCES]: Cleared ${i} presneces in ${this.client.guilds.cache.size} guilds.`);
	}

	public *infinite(arr: ReactionStatus[]) {
		let i = 0;
		while (true) {
			yield arr[i];
			i = (i + 1) % arr.length;
		}
	}
}

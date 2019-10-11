import { Listener } from 'discord-akairo';
import { ActivityType } from 'discord.js';

export interface ReactionStatus {
	text: string;
	type: ActivityType
}

export default class ReadyListener extends Listener {
	public constructor() {
		super('ready', {
			emitter: 'client',
			event: 'ready',
			category: 'client'
		});
	}

	public async exec(): Promise<void> {
		this.client.logger.info(`[READY] ${this.client.user!.tag} is ready to cook 'sm shit.`);
		
		const activities: ReactionStatus[] = [
			{
				text: `${this.client.settings!.reaction.size} Reaction Roles 💪`,
				type: 'WATCHING'
			},
			{
				text: 'https://discord.sycer.dev/ 🔗',
				type: 'WATCHING'
			},
			{
				text: `with ${this.client.guilds.reduce((prev, val) => { return prev + val.memberCount }, 0)} Users 👪`,
				type: 'PLAYING'
			},
			{
				text: `${this.client.guilds.size} Guilds 🛡`,
				type: 'WATCHING'
			}
		];

		const statuses = this.infinite(activities);

		setInterval(() => {
			const status = statuses.next() as IteratorResult<ReactionStatus>;
			this.client.user!.setActivity(status.value.text, { type: status.value.type });
		}, 300000);

		setInterval(async () => {
			for (const g2 of this.client.guilds.values()) {
				g2.presences.clear();
			}
		}, 900);
	}

	public* infinite(arr: ReactionStatus[]) {
		let i = 0;
		while (true) {
			yield arr[i];
			i = (i + 1) % arr.length;
		}
	}
}

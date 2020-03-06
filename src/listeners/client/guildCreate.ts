import { Listener } from 'discord-akairo';
import { Guild, WebhookClient } from 'discord.js';
import { stripIndents } from 'common-tags';

export default class GuildCreateListener extends Listener {
	public constructor() {
		super('guildCreate', {
			emitter: 'client',
			event: 'guildCreate',
			category: 'client',
		});
	}

	public async exec(guild: Guild): Promise<void> {
		const existing = this.client.settings.guild.get(guild.id);
		if (!existing) {
			this.client.settings.new('guild', {
				id: guild.id,
				premium: false,
				prefix: process.env.PREFIX || 'r!',
			});
		}

		const client = new WebhookClient(process.env.SERVERLOGID!, process.env.SERVERLOGTOKEN!);
		try {
			const owner = await this.client.users.fetch(guild.ownerID);
			const embed = this.client.util
				.embed()
				.setColor(this.client.config.color)
				.setAuthor(guild.name, guild.iconURL() || this.client.user!.displayAvatarURL()).setDescription(stripIndents`
					**ID**: \`[${guild.id}]\`
					**Owner**: ${owner.tag} \`[${owner.id}]\`
					**Member Count**: ${guild.memberCount}
					**Created At**: ${guild.createdAt.toUTCString()}
				`);
			client.send({ embeds: [embed] });
		} catch (err) {
			this.client.logger.error(`[GUILDCREATE ERROR]: ${err}`);
		}
	}
}

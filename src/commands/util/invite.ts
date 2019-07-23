import { Command } from 'discord-akairo';
import { Message } from 'discord.js';
import { stripIndents } from 'common-tags';

export default class InviteCommand extends Command {
	public constructor() {
		super('invite', {
			aliases: ['invite', 'support'],
			clientPermissions: ['EMBED_LINKS'],
			description: {
				content: 'Provides an invite link for the bot and our support server.'
			},
			category: 'Utilities'
		});
	}

	public async exec(msg: Message): Promise<Message | Message[]> {
		const embed = this.client.util.embed()
			.setColor(this.client.config.color)
			.setDescription(stripIndents`
				You can invite **${this.client.user!.username}** to your server with [\`this\`](${await this.client.generateInvite(268782656)}) link!
				You can join our **Support Server** by clicking [\`this link\`](https://discord.sycer.dev/)!
			`);
		return msg.util!.send({ embed });
	}
}


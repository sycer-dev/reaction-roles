import { stripIndents } from 'common-tags';
import { Command, PrefixSupplier } from 'discord-akairo';
import { Message } from 'discord.js';

export default class HelpCommand extends Command {
	public constructor() {
		super('help', {
			category: 'Utilities',
			aliases: ['help'],
			description: {
				content: 'Displays all available commands or detailed info for a specific command.',
				usage: '[command]',
				examples: ['', 'ebay', 'size'],
			},
			clientPermissions: ['EMBED_LINKS'],
			args: [
				{
					id: 'command',
					type: 'commandAlias',
					prompt: {
						start: 'Which command would you like more info on?',
						retry: 'Please provide a valid command.',
						optional: true,
					},
				},
			],
		});
	}

	public async exec(msg: Message, { command }: { command: Command | null }): Promise<Message | Message[]> {
		const prefix = (this.handler.prefix as PrefixSupplier)(msg);
		if (!command) {
			const embed = this.client.util
				.embed()
				.setColor(this.client.config.color)
				.setFooter('Made with Love by Fyko 💖')
				.setTitle('📃 Commands').setDescription(stripIndents`
					This is a list of all commands.
                    For more info on a command, type \`${prefix}help <command>\`
                `);

			for (const category of this.handler.categories.values()) {
				if (category.id === 'owner') continue;
				embed.addField(
					`💼 ${category.id}`,
					`${category
						.filter(cmd => cmd.aliases.length > 0)
						.map(
							cmd =>
								`${prefix}\`${cmd.aliases[0]}\`${
									cmd.description && cmd.description.content
										? ` - ${cmd.description.content.split('\n')[0].substring(0, 120)}`
										: ''
								}`,
						)
						.join('\n') || "Nothin' to see here! "}`,
				);
			}
			return msg.util!.send({ embed });
		}
		const embed = this.client.util
			.embed()
			.setColor(this.client.config.color)
			.setFooter('Made with Love by Fyko 💖')
			.setTitle(
				`\`${this.client.config.prefix}${command.aliases[0]} ${
					command.description.usage ? command.description.usage : ''
				}\``,
			);

		if (command.description.content) embed.addField('» Description', command.description.content);
		if (command.aliases.length > 1) embed.addField('» Aliases', `\`${command.aliases.join('`, `')}\``);
		if (command.description.examples && command.description.examples.length)
			embed.addField(
				'» Examples',
				`\`${prefix}${command.aliases[0]} ${command.description.examples
					.map((e: string): string => `${this.client.config.prefix}${e}`)
					.join('\n')}\``,
			);
		return msg.util!.send({ embed });
	}
}

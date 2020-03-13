import { Command } from 'discord-akairo';
import { Message, PermissionResolvable } from 'discord.js';
import { stripIndents } from 'common-tags';

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
		const prefix = msg.guild ? this.client.settings.guild.get(msg.guild.id)!.prefix || 'r!' : 'r!';
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
					`\`💼\` ${category.id}`,
					`${category
						.filter(cmd => cmd.aliases.length > 0)
						.map(
							cmd =>
								`\`${cmd.aliases[0]}\`${
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
				`\`${command.aliases[0]} ${command.description.examples
					.map((e: string): string => `${this.client.config.prefix}${e}`)
					.join('\n')}\``,
			);
		if (command.userPermissions) {
			const permissions = command.userPermissions as Array<PermissionResolvable>;
			embed.addField(
				'» Required Permissions',
				permissions
					.map((i: PermissionResolvable): string => {
						const str = i.toString();
						if (str === 'VIEW_CHANNEL') return '`Read Messages`';
						if (str === 'SEND_TTS_MESSAGES') return '`Send TTS Messages`';
						if (str === 'USE_VAD') return '`Use VAD`';
						return `\`${str
							.replace(/_/g, ' ')
							.toLowerCase()
							.replace(/\b(\w)/g, (char: string): string => char.toUpperCase())}\``;
					})
					.join(', '),
			);
		}
		return msg.util!.send({ embed });
	}
}

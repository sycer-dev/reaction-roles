import { Command } from 'discord-akairo';
import { Message, TextChannel, Role, MessageReaction, User, GuildEmoji, ReactionEmoji } from 'discord.js';
import { stripIndents } from 'common-tags';
import * as nodemoji from 'node-emoji';

export default class AddReactionCommand extends Command {
	public constructor() {
		super('add', {
			aliases: ['new', 'add', 'addrole', 'reactionrole'],
			channel: 'guild',
			category: 'Reaction Roles',
			description: {
				content: 'Creates a new reaction role.',
				usage: '<type> <channel> <message id> <emoji> <role>',
				examples: [
					'1 #reaction-roles 603009228180815882 🍕 Member',
					'2 welcome 603009471236538389 :blobbouce: Blob',
					'3 roles 602918902141288489 :apple: Apples'
				]
			},
			userPermissions: ['MANAGE_ROLES'],
			clientPermissions: ['ADD_REACTIONS', 'MANAGE_ROLES', 'MANAGE_MESSAGES']
		});
	}

	public *args(m: Message): object {
		const type = yield {
			type: 'number',
			prompt: {
				start: stripIndents`
					What type of reaction role do you wish to create?

					\`[1]\` for react to add and remove. *Classic*
					\`[2]\` for react to add only.
					\`[3]\` for react to delete only.
				`,
				restart: stripIndents`
				Please provide a valid number for which type of reaction role do you wish to create?

				\`[1]\` Both react to add and remove. *Classic*
				\`[2]\` Only react to add.
				\`[3]\` Only react to remove role.
			`
			}
		}


		const channel = yield {
			type: 'textChannel',
			prompt: {
				start: 'What channel of the message you\'d like to add this reaction role to?',
				retry: 'Please provide a valid channel.'
			}
		};

		const message = yield {
			type: async (_: Message, str: string): Promise<null | Message> => {
				if (!str) return null;
				try {
					const m = await channel.messages.fetch(str) as Message;
					if (!m) return null;
					return m;
				} catch (err) {
					this.client.logger.error(`[ERR IN MESSAGE on NEW]: ${err}`);
					return null;
				}
			},
			prompt: {
				start: 'What is the ID of the message you want to add that reaction role to?',
				retry: 'Pleae provide a valid message ID.'
			}
		};

		const emoji = yield {
			type: async (msg: Message, str: string): Promise<GuildEmoji | ReactionEmoji | string | null> => {
				if (str) {
					const unicode = nodemoji.find(str);
					if (unicode) return unicode.emoji;

					const custom = this.client.emojis.find(r => r.toString() === str);
					if (custom) return custom.id;
					return null;
				}

				const message = await m.channel.send('Please **react** to **this** message or respond with the emoji you wish to use?\nIf it\'s a custom emoji, please ensure I\'m in the server that it\'s from!') as Message;

				const collector = await message.awaitReactions((r: MessageReaction, u: User): boolean => m.author!.id === u.id, {
					max: 1
				});

				if (!collector || collector.size !== 1) return null;

				const collected = collector.first()!;

				if (collected.emoji.id) {
					const emoji = this.client.emojis.find(e => e.id === collected.emoji.id);
					if (emoji) return emoji;
					return null;
				}
				if (collected.emoji.name) return collected.emoji;

				return null;
			},
			prompt: {
				start: 'Please **react** to **this** message or respond with the emoji you wish to use? If it\'s a custom emoji, please ensure I\'m in the server that it\'s from!',
				retry: 'Please **react** to **this** message or respond with a valid emoji. If it\'s a custom emoji, please ensure I\'m in the server that it\'s from!'
			}
		};

		const role = yield {
			type: 'role',
			match: 'rest',
			prompt: {
				start: 'What role would you like to apply when they react?',
				retry: 'Please provide a valid role.'
			}
		};

		return { type, channel, message, emoji, role };
	}

	public async exec(msg: Message, { type, channel, message, emoji, role }: { type: number, channel: TextChannel; message: Message; emoji: GuildEmoji | ReactionEmoji; role: Role }): Promise<Message | Message[]> {

		if (!channel.permissionsFor(this.client.user!.id)!.has('ADD_REACTIONS')) return msg.util!.reply(`I\'m missing the permissions to react in ${channel}!`);

		try {
			await message.react(emoji);
		} catch (err) {
			this.client.logger.error(`[NEW RR ERROR]: ${err}`);
			return msg.util!.reply(`an error occurred when trying to react to that message: \`${err}\`.`);
		}

		const id = this.makeID();
		
		await this.client.settings!.new('reaction', {
			guildID: msg.guild!.id,
			messageID: message.id,
			userID: msg.author!.id,
			channelID: channel.id,
			id,
			emoji,
			emojiType: emoji.id ? 'custom' : 'unicode',
			roleID: role.id,
			uses: 0,
			type
		});

		const embed = this.client.util.embed()
			.setColor(this.client.config.color)
			.setTitle('New Reaction Role!')
			.setDescription('Please make sure my highest role is above the one you\'re trying to assign!')
			.addField('🔢 Reference ID', id)
			.addField('🏠 Channel', `${channel} \`[${channel.id}]\``)
			.addField('💬 Message', `\`${message.id}\``)
			.addField('🍕 Emoji', emoji.id ? `${emoji} \`[${emoji}]\`` : emoji)
			.addField('💼 Role', `${role} \`[${role.id}]\``);
		return msg.util!.send({ embed });
	}

	public makeID(): string {
		let text = '';
		const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
		for (let i = 0; i < 12; i++) {
			text += possible.charAt(Math.floor(Math.random() * possible.length));
		}
		return text;
	}
}

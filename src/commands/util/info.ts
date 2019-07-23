import { Command } from 'discord-akairo';
import { Message } from 'discord.js';
import { stripIndents } from 'common-tags';

export default class InfoCommand extends Command {
	public constructor() {
		super('info', {
			aliases: ['guide', 'about', 'info'],
			clientPermissions: ['SEND_MESSAGES'],
			description: {
				content: 'Gives information about the bot.'
			},
			category: 'Utilities'
		});
	}

	public async exec(msg: Message): Promise<Message | Message[]> {
		const prefix = msg.guild ? this.client.settings!.guild.get(msg.guild!.id)!.prefix : 'r!';
		const embed = this.client.util.embed()
			.setColor(this.client.config.color)
			.setAuthor(`${this.client.user!.username} Guide`, this.client.user!.displayAvatarURL())
			.addField('**Prerequisites**', stripIndents`
				• Invite the bot with [this](${await this.client.generateInvite(8)}) link.
				• Ensure the bot has the permissions \`Manage Messages\`, \`Send Messages\`, and \`Add Reactions\`.
				• If you plan on creating a Reaction Role, you must have the \`Manage Roles\` permissions.
				• My highest role must be above the role you want to assign upon reaction.
				• ~~If you want to create more than 5 Reaction Roles, vote for us on [DiscordBots.org](https://discordbots.org/)~~ *Soon™*
			`)
			.addField('**Setup**', stripIndents`
				The format for a reaction role is as follows: **\`${prefix} new <type> <channel> <message ID> <emoji> <role>\`**.
				The \`type\` representes what kind of reaction role you'd like to create. If you specify \`1\`, it will be a classic react to add, unreact to remove. \`2\` is a react to add only and vice versa with \`3\`.
				The \`channel\` represents the text channel of the message you want to setup the reaction role on.
				The \`message ID\` represents the ID of the message you want to configure the reaction role on.
				The \`emoji\` represents the emoji that users must react with to recieve or get the role removed.
				And lastly, the \`role\` is the role you want to apply or remove.

				\* If you don't to provide all the arguments at once, you can run \`${prefix}new\` alone and use the Reaction Role Builder™.
				\* When running the command, don't include the <>'s
				\* Some emojis may not be compatible. All Guild emojis and only single-code unicode emojis may work.
			`)
			.addField('**Deletion**', stripIndents`
				If you'd like to delete an existing reaction role, you can:
				a) delete the message the reaction role is on
				b) run \`${prefix}del <ID>\` (the ID provided when you made the Reaction Role)
			`)
			.addField('**Voting**', '*Soon™*')
			.addField('**Contributing**', `${this.client.user!.username} is [Open Source](https://github.com/sycer-dev/reaction-roles)!`)
			.addField('**Support Server**', 'You can join our support server by clicking [this link](https://discord.sycer.dev/)!')
			.setDescription(stripIndents`
				${this.client.user!.username} is a Discord bot to create reaction-based role assignment.
				When a user reacts to a message that has a live message reaction, they will be applied or given the configured role.	
			`);
			return msg.util!.send({ embed });
	}
}


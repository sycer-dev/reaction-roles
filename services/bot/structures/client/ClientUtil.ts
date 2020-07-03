import { APIEmbedData, APIMessageData, APIUserData, APIGuildData, APIChannelData, APIGuildMemberData, APIRoleData } from '@klasa/dapi-types';
import { Routes } from '../../util/constants';
import Client from './Client';
import { find } from 'node-emoji';
import { Embed } from '../../util/embed';

// https://github.com/dirigeants/core/blob/master/src/lib/caching/structures/messages/MessageBuilder.ts
export interface MessageData {
	content?: string | null;
	embed?: APIEmbedData | null;
	nonce?: number | string;
	tts?: boolean;
	allowed_mentions?: Required<AllowedMentions>;
}

// https://github.com/dirigeants/core/blob/master/src/lib/caching/structures/messages/MessageBuilder.ts
export interface AllowedMentions {
	parse?: ('users' | 'roles' | 'everyone')[];
	roles?: string[];
	users?: string[];
}

export default class ClientUtil {
	public routes = Routes;

	// eslint-disable-next-line no-useless-constructor
	public constructor(protected readonly client: Client) {}

	private get rest() {
		return this.client.rest;
	}

	public embed(data?: APIEmbedData) {
		return new Embed(data);
	}

	public tag(user: Partial<APIUserData> & { username: string; discriminator: string }): string {
		return `${user.username}#${user.discriminator}`;
	}

	public async fetchMessage(channelId: string, messageId: string): Promise<APIMessageData> {
		const res = await this.rest.get(this.routes.channelMessage(channelId, messageId));
		return res as APIMessageData;
	}

	public async addReaction(channelId: string, messageId: string, emoji: string): Promise<boolean> {
		const res = await this.rest.get(this.routes.messageReaction(channelId, messageId, encodeURIComponent(emoji)));
		return true;
	}

	public async sendMessage(channelId: string, data: MessageData): Promise<APIMessageData> {
		const res = await this.rest.post(this.routes.channelMessages(channelId), { ...data });
		return res as APIMessageData;
	}

	public async editMessage(channelId: string, messageId: string, data: MessageData): Promise<APIMessageData> {
		const res = await this.rest.patch(this.routes.channelMessage(channelId, messageId), { ...data });
		return res as APIMessageData;
	}

	public async fetchMember(guildId: string, userId: string): Promise<APIGuildMemberData | null> {
		try {
			// TODO: use this.routes
			const response = await this.client.rest.get(`/guilds/${guildId}/members/${userId}`);
			return response as APIGuildMemberData;
		} catch {}

		return null;
	}

	public async fetchGuild(guildId: string): Promise<APIGuildData | null> {
		// try fetching from redis first
		const cached = await this.client.redis.get(`guild.${guildId}`);
		if (cached) {
			try {
				return JSON.parse(cached) as APIGuildData;
			} catch {}
		}

		// hit the API for the guild
		try {
			// TODO: use this.routes
			const response = await this.client.rest.get(`/guilds/${guildId}`);
			return response as APIGuildData;
		} catch {}

		return null;
	}

	public async parseChannel(str: string): Promise<APIChannelData | null> {
		// try fetching from redis before moving on
		const cached = await this.client.redis.get(`channel.${str}`);
		if (cached) {
			try {
				return JSON.parse(cached) as APIChannelData;
			} catch {}
		}

		const reg = /<#(\d{17,19})>/;
		const match = str.match(reg);
		if (match && match[1]) {
			const [, id] = match;
			// try fetching it from redis before hitting the API
			const cached = await this.client.redis.get(`channel.${id}`);
			if (cached) {
				try {
					return JSON.parse(cached) as APIChannelData;
				} catch {}
			}

			// now we hit the API, if this fails we return null
			try {
				// TODO: use this.routes
				const response: APIChannelData = await this.client.rest.get(`/channels/${id}`);
				return response;
			} catch {}
		}

		return null;
	}

	public async parseRole(roleStr: string, guildId: string): Promise<APIRoleData | null> {
		const { roles } = await this.fetchGuild(guildId) ?? { roles: undefined };
		if (!roles) return null;

		// if they provide the role id
		const cached = roles.find(r => [r.id, r.name.toLowerCase()].includes(roleStr.toLowerCase()));
		if (cached) return cached;
	
		// if they ping the role, good for us
		const reg = /<@&(\d{17,19})>/;
		const match = roleStr.match(reg);
		if (match && match[1]) {
			const [, id] = match;
			const cached = roles.find(r => r.id === id);
			if (cached) return cached;
		}

		// fuzzy search via role name
		const found = roles.find(r => r.name.toLowerCase().includes(roleStr.toLowerCase()));
		if (found) return found;

		return null;
	}

	public parseEmoji(str: string): string | null {
		const unicode = find(str);
		if (unicode) return unicode.emoji; 

		// <:klasa:354702113147846666> -> :klasa:354702113147846666
		if (str.startsWith('<')) return str.slice(1, -1);

		// :klasa:354702113147846666 -> :klasa:354702113147846666
		// a:klasa:354702113147846666 -> a:klasa:354702113147846666
		if (str.startsWith(':') || str.startsWith('a:')) return str;

		return null;
	}
}

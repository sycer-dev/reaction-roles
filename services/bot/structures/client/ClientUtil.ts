import { APIEmbedData, APIMessageData, APIUserData } from '@klasa/dapi-types';
import { Routes } from '../../util/constants';
import Client from './Client';
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

	public async sendMessage(channelId: string, data: MessageData): Promise<APIMessageData> {
		const res = await this.rest.post(this.routes.channelMessages(channelId), { ...data });
		return res as APIMessageData;
	}

	public async editMessage(channelId: string, messageId: string, data: MessageData): Promise<APIMessageData> {
		const res = await this.rest.patch(this.routes.channelMessage(channelId, messageId), { ...data });
		return res as APIMessageData;
	}
}

import { Document, Schema, model } from 'mongoose';

export interface Reaction extends Document {
	guildID: string;
	messageID: string;
	channelID: string;
	userID: string;
	id: string;
	emoji: string;
	emojiType: string;
	roleID: string;
	uses: number;
	expiresAt?: Date;
	type: number;
	active: boolean;
}

const Reaction: Schema = new Schema(
	{
		guildID: String,
		messageID: String,
		channelID: String,
		userID: String,
		id: String,
		emoji: String,
		emojiType: String,
		roleID: String,
		uses: Number,
		expiresAt: Date,
		type: Number,
		active: {
			type: Boolean,
			default: true,
		},
	},
	{
		strict: false,
	},
);

export default model<Reaction>('Reaction', Reaction);

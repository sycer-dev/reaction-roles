import { Document, Schema, model } from 'mongoose';

export interface Guild extends Document {
	id: string;
	prefix: string;
	premium: boolean;
	expiresAt: Date;
}

const Guild: Schema = new Schema({
	id: String,
	prefix: String,
	premium: Boolean,
	expiresAt: Date
}, {
	strict: false
});

export default model<Guild>('Guild', Guild);

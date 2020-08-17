import { Entity, BaseEntity, Column, PrimaryGeneratedColumn } from 'typeorm';

export enum EmojiType {
	UNICODE,
	CUSTOM,
}

@Entity('reactions')
export default class Reaction extends BaseEntity {
	@PrimaryGeneratedColumn('increment')
	public id!: number;

	@Column('bigint', { name: 'guild_id' })
	public guildID!: string;

	@Column('bigint', { name: 'channel_id' })
	public channelID!: string;

	@Column('bigint', { name: 'message_id' })
	public messageID!: string;

	@Column('bigint', { name: 'creator_id' })
	public creatorID!: string;

	@Column('bigint', { name: 'role_id' })
	public roleID!: string;

	@Column('text')
	public emoji!: string;

	@Column('enum', { enum: EmojiType, name: 'emoji_type' })
	public emojiType!: EmojiType;

	@Column('boolean', { default: true })
	public active!: boolean;
}

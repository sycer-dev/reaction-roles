import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, CreateDateColumn } from 'typeorm';
import { ObjectType, Field, ID, Root } from 'type-graphql';

@ObjectType()
@Entity('reaction_roles')
export class ReactionRole extends BaseEntity {
	@Field(() => ID)
	@PrimaryGeneratedColumn('increment')
	public id!: string;

	@Field()
	@Column({ type: 'bigint' })
	public guild_id!: string;

	@Field()
	@Column({ type: 'bigint' })
	public channel_id!: string;

	@Field()
	@Column({ type: 'bigint' })
	public message_id!: string;

	@Field()
	@Column({ type: 'bigint' })
	public role_id!: string;

	@Field()
	@Column({ type: 'text' })
	public emoji!: string;

	@Field()
	@Column({ type: 'text' })
	public created_by!: string;

	@Field()
	@CreateDateColumn()
	public created_at!: Date;
}

import { Entity, BaseEntity, PrimaryColumn, Column } from 'typeorm';

@Entity('guilds')
export default class Guild extends BaseEntity {
	/**
	 * The ID of the guild
	 */
	@PrimaryColumn('bigint')
	public id!: string;

	/**
	 * The command prefix for this guild
	 */
	@Column({ default: process.env.PREFIX ?? 'r!' })
	public prefix!: string;

	/**
	 * Wether or not the guild has premium benifits
	 */
	@Column('boolean', { default: false })
	public premium!: boolean;

	/**
	 * When the guild's  premium benifits expire
	 */
	@Column('timestamptz', { nullable: true })
	public expiresAt!: Date | null;
}

import { IsEmail, Length } from 'class-validator';
import { Arg, Ctx, Field, InputType, Mutation, Query, Resolver, ArgsType, Args } from 'type-graphql';
import { ReactionRole } from '../models/ReactionRole';

@InputType()
export class CreateInput {
	@Field()
	@Length(17, 21)
	public guild_id!: string;

	@Field()
	@Length(17, 21)
	public channel_id!: string;

	@Field()
	@Length(17, 21)
	public message_id!: string;

	@Field()
	@Length(17, 21)
	public role_id!: string;

	@Field()
	public emoji!: string;

	@Field()
	@Length(17, 21)
	public created_by!: string;
}

@Resolver()
export class CreateResolver {
	@Query(() => String)
	public async hello() {
		return 'Hello World!';
	}

	@Mutation(() => ReactionRole)
	public async create(
		@Arg('data')
		{ guild_id, channel_id, message_id, role_id, emoji, created_by }: CreateInput,
	): Promise<ReactionRole> {
		const row = await ReactionRole.create({
			guild_id,
			channel_id,
			message_id,
			role_id,
			emoji,
			created_by,
		}).save();

		return row;
	}
}

@ArgsType()
export class FindReactionRoleArgs {
	@Field({ nullable: true, })
	guild_id?: string;

	@Field({ nullable: true })
	channel_id?: string;

	@Field({ nullable: true })
	message_id?: string;

	@Field({ nullable: true })
	role_id?: string;

	@Field({ nullable: true })
	emoji?: string;
}

@Resolver()
export class GetReactionRoleResolver {
	@Query(() => ReactionRole)
	public async get(
		@Arg('id') id: string,
	): Promise<ReactionRole | undefined> {
		const row = await ReactionRole.findOne({ id });
		return row;
	}

	@Query(() => [ReactionRole])
	public async find(
		@Args() args: FindReactionRoleArgs
	): Promise<ReactionRole[]> {
		const params: { [key: string]: string } = {};
		// @ts-ignore
		for (const key of Object.keys(args)) params[key] = args[key];
		const rows = await ReactionRole.find(params);
		return rows;
	}
}

@Resolver()
export class DeleteReactionRoleResolver {
	@Query(() => Boolean)
	public async delete(
		@Arg('id') id: string,
	): Promise<boolean | undefined> {
		const row = await ReactionRole.findOne({ id });
		if (row) await ReactionRole.remove(row);
		return row ? true : false;
	}
}

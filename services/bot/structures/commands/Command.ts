import { APIMessageData } from '@klasa/dapi-types';
import { Permissions } from '@spectacles/util';
import Module from '../core/Module';

export type PermissionsPredicate = (msg: APIMessageData) => boolean;

export type CommandPermissions = (keyof typeof Permissions.FLAGS | number)[] | PermissionsPredicate;

// TODO: add support for dm only or guild only commands 
export interface CommandOptions {
	aliases: string[];
	category: string;
	meta: CommandMeta;
	parseArgs: boolean;
	clientPermissions?: CommandPermissions;
	userPermissions?: CommandPermissions;
}

export interface CommandFlag {
	flags: string[];
	description: string;
}

export interface CommandMeta {
	description: string;
	flags?: CommandFlag[];
	examples?: string[];
	usage?: string;
}

export class Command extends Module {
	public aliases: string[];

	public parseArgs = false;

	public category: string;

	public meta: CommandMeta;

	public clientPermissions?: CommandPermissions;

	public userPermissions?: CommandPermissions;

	public constructor(
		id: string,
		{ aliases, parseArgs, category, meta, clientPermissions, userPermissions }: CommandOptions,
	) {
		super(id);

		this.aliases = aliases;
		this.parseArgs = parseArgs;
		this.category = category;
		this.meta = meta;
		this.clientPermissions = clientPermissions;
		this.userPermissions = userPermissions;
	}

	public run(..._: any[]): unknown {
		throw Error(`Function "run" is not implemented on command "${this.id}"`);
	}

	public static Permissions = Permissions;
}

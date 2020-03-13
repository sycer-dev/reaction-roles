import ReactionClient from './bot';

new ReactionClient({
	token: process.env.TOKEN!,
	owners: process.env.OWNERS!.split(','),
	color: process.env.COLOR!,
	prefix: process.env.PREFIX!,
}).launch();

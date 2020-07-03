import { ApolloServer } from 'apollo-server-express';
import compression from 'compression';
import express from 'express';
import helmet from 'helmet';
import 'reflect-metadata';
import { buildSchema } from 'type-graphql';
import { createConnection } from 'typeorm';
import { CreateResolver, DeleteReactionRoleResolver, GetReactionRoleResolver } from './resolvers/ReactionRoleResolver';

async function run() {
	await createConnection();

	const schema = await buildSchema({
		resolvers: [CreateResolver, DeleteReactionRoleResolver, GetReactionRoleResolver],
	});

	const apolloServer = new ApolloServer({
		schema,
	});

	const app = express()
		.use(helmet())
		.use(compression());

	apolloServer.applyMiddleware({ app });

	app.listen(4000, () => {
		console.log('server started on http://localhost:4000/graphql');
	});
}

run();
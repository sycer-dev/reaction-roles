import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { HttpLink } from 'apollo-link-http';
import gql from 'graphql-tag';

interface CreateInput {
	guild_id: string;
	channel_id: string;
	message_id: string;
	role_id: string;
	emoji: string;
	created_by: string;
}

export const gqlClient = new ApolloClient({
	cache: new InMemoryCache(),
	link: new HttpLink({
		uri: process.env.GRAPHQL_URI,
		// @ts-ignore
		fetch,
	}),
});

export async function createReactionRole(opts: CreateInput) {
	const mutation = gql`
		mutation(guild_id: String!, channel_id: String!, message_id: String!, role_id: String!, emoji: String!, created_by: String!) {
			create(data: {
				guild_id: $guild_id,
				channel_id: {channel_id,
				message_id: $message_id,
				role_id: $role_id,
				emoji: $emoji,
				created_by: $created_by
			}) {
				id
			}
		}
	`;

	const { data } = await gqlClient.mutate({
		mutation,
		variables: { ...opts },
	});

	return data.create.id;
}

import { ApolloClient, ApolloClientOptions } from 'apollo-boost';
import gql from 'graphql-tag';

interface CreateInput {
	guild_id: string;
	channel_id: string;
	message_id: string;
	role_id: string;
	emoji: string;
	created_by: string;
}

interface CreatedRRResponse {
	id: string;
}

export const gqlClient = new ApolloClient({
	// @ts-ignore
	uri: 'http://api:4000',
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
		variables: { ... opts}
	});
	
	return data.create.id;
}
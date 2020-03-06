import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(__dirname, '..', '.env') });

import ReactionClient from './classes/ReactionClient';

const { OWNERS, TOKEN, COLOR, PREFIX } = process.env;

(() => {
	const client = new ReactionClient({
		token: TOKEN!,
		color: COLOR!,
		owners: OWNERS!.split(','),
		prefix: PREFIX!,
	});

	return client.launch();
})();

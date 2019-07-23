import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(__dirname, '..', '.env') });

import ReactionClient from './classes/ReactionClient';

const { OWNERS, TOKEN, MONGO, COLOR, PREFIX, SERVERLOGID, SERVERLOGTOKEN, CMDLOGID, CMDLOGTOKEN } = process.env;

(() => {
	if (!OWNERS) return crash('OWNERS');
	if (!TOKEN) return crash('TOKEN');
	if (!MONGO) return crash('MONGO');
	if (!COLOR) return crash('COLOR');
	if (!PREFIX) return crash('PREFIX');
	if (!SERVERLOGID) return crash('SERVERLOGID');
	if (!SERVERLOGTOKEN) return crash('SERVERLOGTOKEN');
	if (!CMDLOGID) return crash('CMDLOGID');
	if (!CMDLOGTOKEN) return crash('CMDLOGTOKEN');

	const client = new ReactionClient({
		token: TOKEN,
		color: COLOR,
		ownerID: OWNERS.split(','),
		prefix: PREFIX
	});

	return client.launch();
})()

function crash(missing: string): number {
	console.error(`[ENV] I'm missing ${missing} in the .env file! Please add one and restart.`);
	return process.exit(0);
}



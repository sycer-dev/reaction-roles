import OldGuild from '../models/Guild';
import OldReaction from '../models/Reaction';
import { createConnection } from 'typeorm';
import { connect } from 'mongoose';
import { Guild, Reaction, EmojiType } from '..';

async function migrate() {
	await connect('', {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});
	await createConnection();

	const guilds = await OldGuild.find();
	const vaules = guilds
		.map(g => ({
			id: g.id,
			prefix: g.prefix,
			premium: g.premium,
			expiresAt: g.expiresAt,
		}))
		.filter((thing, index, self) => index === self.findIndex(t => t.id === thing.id));

	console.log('waiting 10 seconds before proceeding...');
	await new Promise(r => setTimeout(r, 10 * 1000));

	const hrStart = process.hrtime();
	await Guild.createQueryBuilder()
		.insert()
		.values(vaules)
		.execute();
	const hrStop = process.hrtime(hrStart);
	console.dir(`inserted ${guilds.length} guilds, took ${(hrStop[0] * 1e9 + hrStop[1]) / 1e6}ms`);

	const reactions = await OldReaction.find();
	const rvalues = reactions
		.map(r => ({
			guildID: r.guildID,
			channelID: r.channelID,
			messageID: r.messageID,
			creatorID: r.userID,
			roleID: r.roleID,
			emoji: r.emoji,
			emojiType: r.emojiType === 'unicode' ? EmojiType.UNICODE : EmojiType.CUSTOM,
		}))
		.filter((item, index, array) => array.indexOf(item) === index);

	console.log('waiting 10 seconds before proceeding...');
	await new Promise(r => setTimeout(r, 10 * 1000));

	const hrStartTwo = process.hrtime();
	await Reaction.createQueryBuilder()
		.insert()
		.values(rvalues)
		.execute();
	const hrStopTwo = process.hrtime(hrStartTwo);
	console.dir(`inserted ${rvalues.length} reaction roles, took ${(hrStopTwo[0] * 1e9 + hrStopTwo[1]) / 1e6}ms`);
}

migrate();

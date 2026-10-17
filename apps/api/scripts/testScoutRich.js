const mongoose = require('mongoose');
const workerMongoose = require('../../worker/node_modules/mongoose');

async function main() {
  const uri = 'mongodb://localhost:27017/careerscout';
  await mongoose.connect(uri);
  if (workerMongoose !== mongoose) {
    await workerMongoose.connect(uri);
  }
  console.log('Connected to MongoDB on both mongoose instances');

  const userId = '6ad321e3fdc349e9eab76e0d';
  console.log(`Testing personalized scout for user ${userId}...`);

  const { runPersonalizedScout } = require('../../worker/dist/apps/worker/src/services/scout.service');
  await runPersonalizedScout(userId);

  const matches = await mongoose.connection.collection('useropportunitymatches')
    .find({ userId: new mongoose.Types.ObjectId(userId) })
    .sort({ matchScore: -1 })
    .limit(10)
    .toArray();

  console.log(`\nFound ${matches.length} matches for user ${userId}:`);
  for (const m of matches) {
    console.log(`- ${m.matchScore}% | Matched: [${m.matchedSkills.join(', ')}] | Missing: [${m.missingSkills?.slice(0, 3).join(', ')}] | Reason: ${m.matchReasons?.[0]}`);
  }

  const notifs = await mongoose.connection.collection('notifications')
    .find({ user: new mongoose.Types.ObjectId(userId) })
    .sort({ createdAt: -1 })
    .limit(10)
    .toArray();

  console.log(`\nNotifications created for user (${notifs.length}):`);
  for (const n of notifs) {
    console.log(`- [${n.type}] ${n.title}: ${n.message}`);
  }

  process.exit(0);
}

main().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});

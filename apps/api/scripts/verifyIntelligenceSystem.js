const mongoose = require('mongoose');

async function main() {
  await mongoose.connect('mongodb://localhost:27017/careerscout');
  console.log('Connected to MongoDB');

  const { DevfolioProvider } = require('../../worker/src/providers/DevfolioProvider');
  const { revalidateOpportunityFreshness } = require('../../worker/src/services/freshness.service');

  console.log('Testing DevfolioProvider...');
  const devfolio = new DevfolioProvider();
  await devfolio.run();

  console.log('Testing freshness revalidation...');
  const freshnessResult = await revalidateOpportunityFreshness();
  console.log('Freshness result:', freshnessResult);

  const oppCollection = mongoose.connection.collection('opportunities');
  const sourceCollection = mongoose.connection.collection('opportunitysources');

  const sources = await sourceCollection.find().toArray();
  console.log('\n--- OPPORTUNITY SOURCES HEALTH ---');
  for (const s of sources) {
    console.log(`- ${s.name} (${s.identifier}): Status=${s.status}, Found=${s.opportunitiesFound}, Active=${s.totalOpportunitiesActive}, LastRun=${s.lastRunAt?.toISOString()}`);
  }

  const total = await oppCollection.countDocuments();
  const active = await oppCollection.countDocuments({ isActive: true, status: { $ne: 'EXPIRED' } });
  const expired = await oppCollection.countDocuments({ status: 'EXPIRED' });
  const unverified = await oppCollection.countDocuments({ status: 'UNVERIFIED' });
  
  const jobs = await oppCollection.countDocuments({ type: { $in: ['JOB', 'FREELANCE'] }, isActive: true, status: { $ne: 'EXPIRED' } });
  const internships = await oppCollection.countDocuments({ type: 'INTERNSHIP', isActive: true, status: { $ne: 'EXPIRED' } });
  const hackathons = await oppCollection.countDocuments({ type: 'HACKATHON', isActive: true, status: { $ne: 'EXPIRED' } });
  const competitions = await oppCollection.countDocuments({ type: 'COMPETITION', isActive: true, status: { $ne: 'EXPIRED' } });

  console.log('\n--- OPPORTUNITY DATABASE COUNTS ---');
  console.log(`Total Records: ${total}`);
  console.log(`Active (non-expired): ${active}`);
  console.log(`Expired: ${expired}`);
  console.log(`Unverified: ${unverified}`);
  console.log(`Active Jobs: ${jobs}`);
  console.log(`Active Internships: ${internships}`);
  console.log(`Active Hackathons: ${hackathons}`);
  console.log(`Active Competitions: ${competitions}`);

  // Test personalized scout with notifications
  const user = await mongoose.connection.collection('users').findOne({});
  if (user) {
    console.log(`\nTesting runPersonalizedScout for user ${user._id} (${user.email})...`);
    const { runPersonalizedScout } = require('../../worker/src/services/scout.service');
    await runPersonalizedScout(user._id.toString());

    const matches = await mongoose.connection.collection('useropportunitymatches').find({ userId: user._id }).sort({ matchScore: -1 }).limit(5).toArray();
    console.log(`Top matches for user:`);
    for (const m of matches) {
      console.log(`- Score: ${m.matchScore}% | MatchedSkills: [${m.matchedSkills.join(', ')}] | Reasons: ${m.matchReasons?.[0] || 'N/A'}`);
    }

    const notifs = await mongoose.connection.collection('notifications').find({ user: user._id }).sort({ createdAt: -1 }).limit(5).toArray();
    console.log(`\nRecent notifications created for user (${notifs.length}):`);
    for (const n of notifs) {
      console.log(`- [${n.type}] ${n.title}: ${n.message}`);
    }
  }

  process.exit(0);
}

main().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});

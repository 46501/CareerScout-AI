const mongoose = require('mongoose');

async function main() {
  await mongoose.connect('mongodb://localhost:27017/careerscout');
  console.log('Connected to MongoDB');

  const { getOpportunityStatus, getOpportunities } = require('../dist/apps/api/src/controllers/opportunity.controller');

  // Test 1: getOpportunityStatus
  console.log('\n--- TEST 1: getOpportunityStatus ---');
  let statusResult = null;
  const mockResStatus = {
    status: (code) => ({
      json: (data) => {
        statusResult = { code, data };
      }
    })
  };
  await getOpportunityStatus({}, mockResStatus, (err) => console.error(err));
  console.log('Status code:', statusResult.code);
  console.log('Total Active:', statusResult.data?.data?.totalActive);
  console.log('Counts by Category:', JSON.stringify(statusResult.data?.data?.countsByCategory, null, 2));
  console.log('Connected Sources:', statusResult.data?.data?.sources.map(s => `${s.name} (${s.status})`));

  // Test 2: getOpportunities (default: excludes expired)
  console.log('\n--- TEST 2: getOpportunities (default) ---');
  let oppsResult = null;
  const mockResOpps = {
    status: (code) => ({
      json: (data) => {
        oppsResult = { code, data };
      }
    })
  };
  await getOpportunities(
    { query: { page: 1, limit: 5 } },
    mockResOpps,
    (err) => console.error(err)
  );
  console.log('Default query returned:', oppsResult.data?.data?.length, 'opportunities. Total:', oppsResult.data?.pagination?.total);

  // Test 3: getOpportunities with type=Internship
  console.log('\n--- TEST 3: getOpportunities (type=Internship) ---');
  let internResult = null;
  await getOpportunities(
    { query: { type: 'Internships', limit: 5 } },
    {
      status: (code) => ({
        json: (data) => {
          internResult = { code, data };
        }
      })
    },
    (err) => console.error(err)
  );
  console.log('Internships found:', internResult.data?.pagination?.total);
  if (internResult.data?.data?.[0]) {
    console.log('Sample internship:', internResult.data.data[0].title, 'at', internResult.data.data[0].organization);
  }

  // Test 4: getOpportunities with type=Hackathons
  console.log('\n--- TEST 4: getOpportunities (type=Hackathons) ---');
  let hackResult = null;
  await getOpportunities(
    { query: { type: 'Hackathons', limit: 5 } },
    {
      status: (code) => ({
        json: (data) => {
          hackResult = { code, data };
        }
      })
    },
    (err) => console.error(err)
  );
  console.log('Hackathons found:', hackResult.data?.pagination?.total);
  if (hackResult.data?.data?.[0]) {
    console.log('Sample hackathon:', hackResult.data.data[0].title, 'at', hackResult.data.data[0].organization, '| Deadline:', hackResult.data.data[0].deadline);
  }

  // Test 5: getOpportunities with minScore=70 for user 6ad321e3fdc349e9eab76e0d
  console.log('\n--- TEST 5: getOpportunities (minScore=70) ---');
  let scoreResult = null;
  await getOpportunities(
    {
      user: { id: '6ad321e3fdc349e9eab76e0d' },
      query: { minScore: '70', limit: 5 }
    },
    {
      status: (code) => ({
        json: (data) => {
          scoreResult = { code, data };
        }
      })
    },
    (err) => console.error(err)
  );
  console.log('Opportunities matching >= 70% score:', scoreResult.data?.pagination?.total);
  for (const o of (scoreResult.data?.data || [])) {
    console.log(`- ${o.title} | Score: ${o.matchDetails?.score}% | Reason: ${o.matchDetails?.reasons?.[0]}`);
  }

  process.exit(0);
}

main().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});

const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const http = require('http');

async function testOpportunitiesApi() {
  await mongoose.connect('mongodb://localhost:27017/careerscout');
  const user = await mongoose.connection.db.collection('users').findOne({});
  if (!user) {
    console.error('No user found in database!');
    process.exit(1);
  }

  const token = jwt.sign(
    { id: user._id.toString(), email: user.email, role: user.role || 'STUDENT' },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: '1h' }
  );

  console.log(`Generated test token for user: ${user.email} (${user._id})`);
  await mongoose.disconnect();

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/opportunities',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  };

  const req = http.request(options, (res) => {
    let raw = '';
    res.on('data', chunk => raw += chunk);
    res.on('end', () => {
      try {
        const json = JSON.parse(raw);
        if (!json.success || !Array.isArray(json.data)) {
          console.error('API call failed or returned unexpected response:', json);
          process.exit(1);
        }

        console.log(`\n=== VERIFYING /api/opportunities (${json.data.length} results returned) ===`);
        let htmlTagsFound = 0;
        let entitiesFound = 0;

        for (const [index, opp] of json.data.entries()) {
          const desc = opp.description || '';
          const hasTag = /<[a-z\/!][\s\S]*>/i.test(desc);
          const hasEntity = /&[a-zA-Z0-9#]+;/.test(desc);

          if (hasTag) htmlTagsFound++;
          if (hasEntity) entitiesFound++;

          console.log(`\n[Opportunity #${index + 1}]`);
          console.log(`  Title:                  ${opp.title}`);
          console.log(`  Company:                ${opp.organization}`);
          console.log(`  Location:               ${opp.location}`);
          console.log(`  Salary:                 ${opp.salary || 'N/A'}`);
          console.log(`  Remote:                 ${opp.remoteType}`);
          console.log(`  Type:                   ${opp.type}`);
          console.log(`  ApplicationUrl:         ${opp.applicationUrl}`);
          console.log(`  Description (100 chars): "${desc.slice(0, 100).replace(/\n/g, ' ')}..."`);
          console.log(`  Has Raw Tags?           ${hasTag}`);
          console.log(`  Has Unresolved Entity?  ${hasEntity}`);
        }

        console.log('\n========================================');
        console.log('===       VERIFICATION SUMMARY       ===');
        console.log('========================================');
        console.log(`Total Opportunities Checked:            ${json.data.length}`);
        console.log(`Opportunities with HTML tags:           ${htmlTagsFound}`);
        console.log(`Opportunities with Unresolved Entities: ${entitiesFound}`);

        if (htmlTagsFound === 0 && entitiesFound === 0 && json.data.length > 0) {
          console.log('\n>>> SUCCESS: All opportunities have clean, readable, plain-text descriptions with 0 HTML tags or unresolved entities! <<<');
        } else {
          console.error('\n>>> FAILURE: Some opportunities still contain HTML or entities. <<<');
          process.exit(1);
        }

      } catch (err) {
        console.error('Error parsing response:', err, raw);
        process.exit(1);
      }
    });
  });

  req.on('error', (err) => {
    console.error('HTTP Request error:', err);
    process.exit(1);
  });

  req.end();
}

testOpportunitiesApi().catch(err => {
  console.error(err);
  process.exit(1);
});

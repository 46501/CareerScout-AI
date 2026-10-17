const mongoose = require('mongoose');

async function check() {
  await mongoose.connect('mongodb://localhost:27017/careerscout');
  const opps = await mongoose.connection.db.collection('opportunities').find({}).toArray();
  console.log(`Checking ${opps.length} opportunities...`);

  let htmlCount = 0;
  for (const opp of opps) {
    const hasHtml = /<[a-z\/!]/i.test(opp.description || '') || /&[a-z0-9#]+;/i.test(opp.description || '');
    if (hasHtml) {
      htmlCount++;
      console.log(`\nSTILL HAS HTML: ${opp.title} (${opp.organization})`);
      console.log(`Desc preview: ${opp.description.slice(0, 100)}`);
    } else {
      console.log(`CLEAN: [${opp.organization}] ${opp.title.slice(0, 40)} -> ${opp.description.slice(0, 60).replace(/\n/g, ' ')}...`);
    }
  }
  console.log(`\nSummary: ${htmlCount} with HTML, ${opps.length - htmlCount} clean.`);
  await mongoose.disconnect();
}

check();

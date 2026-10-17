const https = require('https');

function getUrl(url) {
  return new Promise((resolve) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, json: JSON.parse(data) });
        } catch(e) {
          resolve({ status: res.statusCode, text: data.slice(0, 300) });
        }
      });
    }).on('error', err => resolve({ error: err.message }));
  });
}

async function testSources() {
  console.log('Testing GSoC Organizations/Programs feed...');
  // GSoC organizations public JSON
  const r1 = await getUrl('https://summerofcode.withgoogle.com/api/program/current/organizations/');
  console.log('GSoC status:', r1.status, Array.isArray(r1.json) ? `Found ${r1.json.length} organizations` : (r1.json?.results ? `Found ${r1.json.results.length} results` : r1.text));

  console.log('Testing Devfolio public hackathons & competitions...');
  const r2 = await getUrl('https://api.devfolio.co/api/hackathons?filter=all&page=1&limit=20');
  console.log('Devfolio status:', r2.status, r2.json ? `Found ${r2.json.result?.length || r2.json.length} items` : r2.text);

  console.log('Testing Kaggle Competitions RSS/feed...');
  const r3 = await getUrl('https://www.kaggle.com/api/v1/competitions/list');
  console.log('Kaggle status:', r3.status, r3.text);
}

testSources();

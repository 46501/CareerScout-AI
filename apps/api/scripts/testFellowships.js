const https = require('https');

function getUrl(url) {
  return new Promise((resolve) => {
    https.get(url, { headers: { 'User-Agent': 'CareerScoutAI/1.0' } }, (res) => {
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

async function test() {
  const r1 = await getUrl('https://raw.githubusercontent.com/yashisrani/List-of-OpenSource-Programs/master/data.json');
  console.log('List-of-OpenSource-Programs data.json:', r1.status, Array.isArray(r1.json) ? `Found ${r1.json.length} programs` : r1.text);

  const r2 = await getUrl('https://raw.githubusercontent.com/zshah101/Automated-List-Of-Summer-2027-and-Fall-2026-Tech-Internships/main/data.json');
  console.log('zshah101 data.json:', r2.status, r2.text);
}

test();

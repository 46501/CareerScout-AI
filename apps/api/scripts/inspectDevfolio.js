const https = require('https');

https.get('https://api.devfolio.co/api/hackathons?filter=all&page=1&limit=20', { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log('Keys in Devfolio response:', Object.keys(json));
      const items = json.result || json.hackathons || json;
      console.log('Total items in result:', Array.isArray(items) ? items.length : 'not array');
      if (Array.isArray(items) && items.length > 0) {
        console.log('Sample item 1:');
        const it = items[0];
        console.log({
          slug: it.slug,
          name: it.name,
          tagline: it.tagline,
          desc: it.desc?.slice(0, 80),
          is_online: it.is_online,
          starts_at: it.starts_at,
          ends_at: it.ends_at,
          status: it.status,
          hackathon_setting: it.hackathon_setting,
          location: it.location
        });
      }
    } catch(e) {
      console.error(e);
    }
  });
});

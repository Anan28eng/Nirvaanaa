const http = require('http');

function fetch(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
    }).on('error', reject);
  });
}

(async () => {
  try {
    const base = 'http://localhost:3001';
    const ad = await fetch(base + '/api/announcements/adbanner');
    console.log('\n=== AD BANNER ===');
    console.log('Status:', ad.status);
    console.log('Headers:', ad.headers['content-type'] || '');
    console.log('Body:', ad.body || '<empty>');

    const ann = await fetch(base + '/api/announcements/announcement');
    console.log('\n=== ANNOUNCEMENT ===');
    console.log('Status:', ann.status);
    console.log('Headers:', ann.headers['content-type'] || '');
    console.log('Body:', ann.body || '<empty>');
  } catch (err) {
    console.error('Request failed:', err && err.message ? err.message : err);
    process.exitCode = 2;
  }
})();

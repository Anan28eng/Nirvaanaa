const http = require('http');

function request(url, opts = {}){
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const lib = u.protocol === 'https:' ? require('https') : require('http');
    const data = opts.body ? JSON.stringify(opts.body) : null;
    const headers = Object.assign({'Content-Type':'application/json'}, opts.headers || {});
    const req = lib.request(u, { method: opts.method || 'GET', headers }, res => {
      let body = '';
      res.on('data', c=> body += c);
      res.on('end', ()=> resolve({ status: res.statusCode, body }));
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

(async()=>{
  try{
    const base = 'http://localhost:3001';
    console.log('Fetching adbanner...');
    const adRes = await request(base + '/api/announcements/adbanner');
    console.log('ad GET status', adRes.status);
    console.log('ad body', adRes.body);
    console.log('\nFetching announcement...');
    const annRes = await request(base + '/api/announcements/announcement');
    console.log('ann GET status', annRes.status);
    console.log('ann body', annRes.body);

    const ad = adRes.body ? JSON.parse(adRes.body) : null;
    const ann = annRes.body ? JSON.parse(annRes.body) : null;

    if (ad && ad.banner && ad.banner._id) {
      const newVal = !ad.banner.isAdBannerActive;
      console.log('\nToggling adbanner to', newVal);
      const putRes = await request(base + '/api/announcements/adbanner', { method: 'PUT', body: { id: ad.banner._id, isAdBannerActive: newVal } });
      console.log('ad PUT status', putRes.status);
      console.log('ad PUT body', putRes.body);
    } else {
      console.log('No adbanner found to toggle');
    }

    if (ann && ann.banner && ann.banner._id) {
      const newVal = !ann.banner.isAnnouncementActive;
      console.log('\nToggling announcement to', newVal);
      const putRes2 = await request(base + '/api/announcements/announcement', { method: 'PUT', body: { id: ann.banner._id, isAnnouncementActive: newVal } });
      console.log('ann PUT status', putRes2.status);
      console.log('ann PUT body', putRes2.body);
    } else {
      console.log('No announcement found to toggle');
    }

    // fetch again
    const adRes2 = await request(base + '/api/announcements/adbanner');
    console.log('\nAfter toggle ad GET status', adRes2.status);
    console.log('ad body', adRes2.body);
    const annRes2 = await request(base + '/api/announcements/announcement');
    console.log('\nAfter toggle ann GET status', annRes2.status);
    console.log('ann body', annRes2.body);

    console.log('\nToggle test complete');
    process.exit(0);
  }catch(err){
    console.error('Toggle test failed:', err && err.message ? err.message : err);
    process.exit(2);
  }
})();

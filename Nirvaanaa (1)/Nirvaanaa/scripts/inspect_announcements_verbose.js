const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');

(async () => {
  try {
    console.log('Starting verbose announcement inspection...');
    const envPath = path.join(process.cwd(), '.env.local');
    if (!fs.existsSync(envPath)) {
      console.error('.env.local not found in project root');
      process.exit(2);
    }
    const env = fs.readFileSync(envPath, 'utf8');
    const match = env.split(/\r?\n/).find(l => l.startsWith('MONGODB_URI='));
    if (!match) {
      console.error('MONGODB_URI not found in .env.local');
      process.exit(2);
    }
    const uri = match.split('=')[1].trim();
    console.log('Using MongoDB URI:', uri);
    const client = new MongoClient(uri, { useUnifiedTopology: true });
    await client.connect();
    console.log('Connected to MongoDB');
    const dbName = (new URL(uri.indexOf('mongodb://') === 0 ? 'http://dummy' : uri)).pathname.replace('/', '') || 'nirvaanaa';
    // fallback: if db not found in URI use 'nirvaanaa'
    const db = client.db();
    console.log('DB name:', db.databaseName);
    const coll = db.collection('announcements');
    const docs = await coll.find({}).toArray();
    console.log('Found', docs.length, 'announcement documents');
    docs.forEach((d, i) => {
      console.log('\n--- Document', i+1, '---');
      console.log('id:', d._id);
      console.log('type:', d.type);
      console.log('text:', d.text);
      console.log('isAnnouncementActive:', d.isAnnouncementActive);
      console.log('isAdBannerActive:', d.isAdBannerActive);
      console.log('backgroundColor:', d.backgroundColor);
      console.log('textColor:', d.textColor);
      console.log('priority:', d.priority);
      console.log('startDate:', d.startDate);
      console.log('endDate:', d.endDate);
    });
    await client.close();
    console.log('\nDone.');
  } catch (err) {
    console.error('Error during inspection:', err && err.stack ? err.stack : err);
    process.exit(2);
  }
})();

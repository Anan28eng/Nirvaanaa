const path = require('path');

(async function(){
  try{
    // Use ESM imports via dynamic import since project uses ESM
    const db = await import(path.join(process.cwd(),'lib','mongodb.js'));
    const Announcement = await import(path.join(process.cwd(),'models','Announcement.js'));
    // Ensure NODE_ENV picks up .env.local; rely on process.env
    await db.default();
    const Ann = Announcement.default;
    const ad = await Ann.find({ type: 'adbanner' }).lean().exec();
    const ann = await Ann.find({ type: 'announcement' }).lean().exec();
    console.log('AD BANNERS:', JSON.stringify(ad, null, 2));
    console.log('\nANNOUNCEMENTS:', JSON.stringify(ann, null, 2));
    process.exit(0);
  }catch(err){
    console.error('Error inspecting announcements:', err && err.message ? err.message : err);
    process.exit(2);
  }
})();

const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
(async()=>{
  try{
    const env = fs.readFileSync(path.join(process.cwd(),'.env.local'),'utf8');
    const uri = env.split(/\r?\n/).find(l=>l.startsWith('MONGODB_URI')).split('=')[1].trim();
    await mongoose.connect(uri,{useNewUrlParser:true,useUnifiedTopology:true});
    const Ann = require(path.join(process.cwd(),'models','Announcement.js')).default;
    const ad = await Ann.findAdBanner();
    const ann = await Ann.findAnnouncementBanner();
    console.log('findAdBanner ->', JSON.stringify(ad,null,2));
    console.log('findAnnouncementBanner ->', JSON.stringify(ann,null,2));
    process.exit(0);
  }catch(e){console.error('ERR',e && e.stack?e.stack:e);process.exit(2);} })();

const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');

(async function(){
  try{
    const envPath = path.join(process.cwd(), '.env.local');
    const env = fs.readFileSync(envPath,'utf8');
    const uriLine = env.split(/\r?\n/).find(l=>l.startsWith('MONGODB_URI='));
    const uri = uriLine.split('=')[1].trim();
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to DB');
    const User = require(path.join(process.cwd(),'models','User.js')).default;
    const Announcement = require(path.join(process.cwd(),'models','Announcement.js')).default;

    let admin = await User.findOne({ role: 'admin' }).exec();
    if (!admin) {
      admin = new User({ name: 'Admin', email: 'libramank@gmail.com', role: 'admin' });
      admin.password = 'ChangeMe123!';
      await admin.save();
      console.log('Created admin user:', admin.email);
    } else {
      console.log('Found admin user:', admin.email);
    }

    // Insert or update adbanner
    let ad = await Announcement.findOne({ type: 'adbanner' }).exec();
    if (!ad) {
      ad = new Announcement({
        text: 'Grand opening sale: 30% off on all bags! Use code: NIRV30',
        type: 'adbanner',
        isAdBannerActive: true,
        backgroundColor: '#bfae9e',
        textColor: '#ffffff',
        priority: 10,
        createdBy: admin._id
      });
      await ad.save();
      console.log('Inserted adbanner with id', ad._id);
    } else {
      ad.isAdBannerActive = true;
      ad.text = ad.text || 'Grand opening sale: 30% off on all bags! Use code: NIRV30';
      await ad.save();
      console.log('Updated existing adbanner', ad._id);
    }

    // Insert or update announcement
    let ann = await Announcement.findOne({ type: 'announcement' }).exec();
    if (!ann) {
      ann = new Announcement({
        text: 'Free shipping over ₹1500. Limited time offer!',
        type: 'announcement',
        isAnnouncementActive: true,
        backgroundColor: '#f59e0b',
        textColor: '#ffffff',
        priority: 8,
        createdBy: admin._id
      });
      await ann.save();
      console.log('Inserted announcement with id', ann._id);
    } else {
      ann.isAnnouncementActive = true;
      ann.text = ann.text || 'Free shipping over ₹1500. Limited time offer!';
      await ann.save();
      console.log('Updated existing announcement', ann._id);
    }

    console.log('Done seeding banners');
    process.exit(0);
  }catch(err){
    console.error('Error seeding banners:', err);
    process.exit(2);
  }
})();

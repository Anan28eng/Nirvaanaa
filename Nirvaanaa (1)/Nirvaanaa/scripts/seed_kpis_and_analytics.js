const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nirvaanaa');

// KPI Schema
const kpiSchema = new mongoose.Schema({
  label: { type: String, required: true },
  value: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

// Analytics Schema
const analyticsSchema = new mongoose.Schema({
  type: { type: String, enum: ['revenue', 'orders', 'customers'], required: true },
  date: { type: Date, required: true },
  value: { type: Number, required: true },
  range: { type: String, enum: ['day', 'week', 'month', 'year'], required: true },
}, { timestamps: true });

const KPI = mongoose.model('KPI', kpiSchema);
const Analytics = mongoose.model('Analytics', analyticsSchema);

// Generate date ranges
function generateDateRanges() {
  const now = new Date();
  const ranges = {
    day: [],
    week: [],
    month: [],
    year: []
  };

  // Generate daily data for the last 30 days
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    ranges.day.push({
      date: date.toISOString().split('T')[0],
      value: Math.floor(Math.random() * 50000) + 10000 // 10k-60k revenue
    });
  }

  // Generate weekly data for the last 12 weeks
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - (i * 7));
    ranges.week.push({
      date: date.toISOString().split('T')[0],
      value: Math.floor(Math.random() * 300000) + 50000 // 50k-350k revenue
    });
  }

  // Generate monthly data for the last 12 months
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now);
    date.setMonth(date.getMonth() - i);
    ranges.month.push({
      date: date.toISOString().split('T')[0],
      value: Math.floor(Math.random() * 1000000) + 200000 // 200k-1.2M revenue
    });
  }

  // Generate yearly data for the last 5 years
  for (let i = 4; i >= 0; i--) {
    const date = new Date(now);
    date.setFullYear(date.getFullYear() - i);
    ranges.year.push({
      date: date.toISOString().split('T')[0],
      value: Math.floor(Math.random() * 5000000) + 1000000 // 1M-6M revenue
    });
  }

  return ranges;
}

// Generate orders data
function generateOrdersData() {
  const now = new Date();
  const ranges = {
    day: [],
    week: [],
    month: [],
    year: []
  };

  // Daily orders
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    ranges.day.push({
      date: date.toISOString().split('T')[0],
      value: Math.floor(Math.random() * 50) + 10 // 10-60 orders
    });
  }

  // Weekly orders
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - (i * 7));
    ranges.week.push({
      date: date.toISOString().split('T')[0],
      value: Math.floor(Math.random() * 300) + 50 // 50-350 orders
    });
  }

  // Monthly orders
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now);
    date.setMonth(date.getMonth() - i);
    ranges.month.push({
      date: date.toISOString().split('T')[0],
      value: Math.floor(Math.random() * 1000) + 200 // 200-1200 orders
    });
  }

  // Yearly orders
  for (let i = 4; i >= 0; i--) {
    const date = new Date(now);
    date.setFullYear(date.getFullYear() - i);
    ranges.year.push({
      date: date.toISOString().split('T')[0],
      value: Math.floor(Math.random() * 5000) + 1000 // 1000-6000 orders
    });
  }

  return ranges;
}

// Generate customers data
function generateCustomersData() {
  const now = new Date();
  const ranges = {
    day: [],
    week: [],
    month: [],
    year: []
  };

  // Daily customers
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    ranges.day.push({
      date: date.toISOString().split('T')[0],
      value: Math.floor(Math.random() * 20) + 5 // 5-25 customers
    });
  }

  // Weekly customers
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - (i * 7));
    ranges.week.push({
      date: date.toISOString().split('T')[0],
      value: Math.floor(Math.random() * 100) + 20 // 20-120 customers
    });
  }

  // Monthly customers
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now);
    date.setMonth(date.getMonth() - i);
    ranges.month.push({
      date: date.toISOString().split('T')[0],
      value: Math.floor(Math.random() * 400) + 100 // 100-500 customers
    });
  }

  // Yearly customers
  for (let i = 4; i >= 0; i--) {
    const date = new Date(now);
    date.setFullYear(date.getFullYear() - i);
    ranges.year.push({
      date: date.toISOString().split('T')[0],
      value: Math.floor(Math.random() * 2000) + 500 // 500-2500 customers
    });
  }

  return ranges;
}

async function seedKPIsAndAnalytics() {
  try {
    console.log('🌱 Seeding KPIs and Analytics...');

    // Clear existing data
    await KPI.deleteMany({});
    await Analytics.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Seed KPIs
    const kpis = [
      { label: 'Total Revenue', value: '₹2,450,000' },
      { label: 'Total Orders', value: '1,234' },
      { label: 'Active Customers', value: '856' },
      { label: 'Products Sold', value: '3,421' },
      { label: 'Average Order Value', value: '₹1,987' },
      { label: 'Conversion Rate', value: '3.2%' },
      { label: 'Customer Satisfaction', value: '4.8/5' },
      { label: 'Return Rate', value: '2.1%' }
    ];

    for (const kpi of kpis) {
      await KPI.create(kpi);
    }
    console.log(`✅ Seeded ${kpis.length} KPIs`);

    // Generate analytics data
    const revenueData = generateDateRanges();
    const ordersData = generateOrdersData();
    const customersData = generateCustomersData();

    // Seed revenue analytics
    for (const [range, data] of Object.entries(revenueData)) {
      for (const item of data) {
        await Analytics.create({
          type: 'revenue',
          date: new Date(item.date),
          value: item.value,
          range
        });
      }
    }

    // Seed orders analytics
    for (const [range, data] of Object.entries(ordersData)) {
      for (const item of data) {
        await Analytics.create({
          type: 'orders',
          date: new Date(item.date),
          value: item.value,
          range
        });
      }
    }

    // Seed customers analytics
    for (const [range, data] of Object.entries(customersData)) {
      for (const item of data) {
        await Analytics.create({
          type: 'customers',
          date: new Date(item.date),
          value: item.value,
          range
        });
      }
    }

    console.log('✅ Seeded analytics data for all ranges');

    // Show summary
    const kpiCount = await KPI.countDocuments();
    const analyticsCount = await Analytics.countDocuments();
    
    console.log('\n📊 Seeding Summary:');
    console.log(`KPIs: ${kpiCount}`);
    console.log(`Analytics Records: ${analyticsCount}`);
    
    // Show analytics breakdown
    const analyticsBreakdown = await Analytics.aggregate([
      { $group: { _id: { type: '$type', range: '$range' }, count: { $sum: 1 } } }
    ]);
    
    console.log('\n📈 Analytics Breakdown:');
    analyticsBreakdown.forEach(item => {
      console.log(`${item._id.type} (${item._id.range}): ${item.count} records`);
    });

    console.log('\n🎉 Seeding completed successfully!');

  } catch (error) {
    console.error('❌ Error seeding data:', error);
  } finally {
    mongoose.disconnect();
  }
}

seedKPIsAndAnalytics();

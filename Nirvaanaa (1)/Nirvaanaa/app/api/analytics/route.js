import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';
import User from '@/models/User';

// Analytics Schema for database queries
const analyticsSchema = {
  type: { type: String, enum: ['revenue', 'orders', 'customers'], required: true },
  date: { type: Date, required: true },
  value: { type: Number, required: true },
  range: { type: String, enum: ['day', 'week', 'month', 'year'], required: true },
};

export async function GET(request) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
  const range = searchParams.get('range') || 'month';
    
    // compute real-time analytics from Orders and Users without dummy fallback
    const days = range === 'year' ? 365 : range === 'month' ? 30 : range === 'week' ? 7 : 1;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (days - 1));

    const ordersAgg = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate }, paymentStatus: { $in: ['paid', 'succeeded'] } } },
      { $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          totalRevenue: { $sum: '$total' },
          totalOrders: { $sum: 1 },
        } },
      { $sort: { _id: 1 } },
    ]);

    const usersAgg = await User.aggregate([
      { $match: { lastLogin: { $gte: startDate } } },
      { $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$lastLogin' } },
          loggedIn: { $sum: 1 },
        } },
      { $sort: { _id: 1 } },
    ]);

    // Helper to build full date range and fill missing days with zeros
    const buildSeries = (agg, field) => {
      const map = new Map();
      agg.forEach(d => map.set(d._id, d[field] || 0));

      const series = [];
      const cur = new Date(startDate);
      const end = new Date();
      while (cur <= end) {
        const yyyy = cur.getFullYear();
        const mm = String(cur.getMonth() + 1).padStart(2, '0');
        const dd = String(cur.getDate()).padStart(2, '0');
        const key = `${yyyy}-${mm}-${dd}`;
        series.push({ date: key, value: map.get(key) || 0 });
        cur.setDate(cur.getDate() + 1);
      }
      return series;
    };

    const revenue = buildSeries(ordersAgg, 'totalRevenue');
    const orders = buildSeries(ordersAgg, 'totalOrders');
    const customers = buildSeries(usersAgg, 'loggedIn');

    return NextResponse.json({ revenue, orders, customers, kpis: [] });
  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}



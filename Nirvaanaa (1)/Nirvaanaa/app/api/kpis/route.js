import dbConnect from '@/lib/mongodb';
import Kpi from '@/models/Kpi';
import Order from '@/models/Order';
import User from '@/models/User';
import Product from '@/models/Product';
import { emitToAdmin } from '@/lib/socket';

export async function GET(req) {
  await dbConnect();
  try {
    // stored KPIs
      let stored = [];
      try {
        const q = await Kpi.find();
        if (Array.isArray(q)) stored = q;
        else if (typeof q.sort === 'function') stored = await q.sort({ createdAt: -1 }).lean();
      } catch (e) {
        stored = [];
      }

    // compute live KPIs
    const totalRevenueAgg = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$total' }, orders: { $sum: 1 } } }
    ]);
    const totalRevenue = (totalRevenueAgg[0]?.total) || 0;
    const totalOrders = (totalRevenueAgg[0]?.orders) || 0;

    const totalCustomers = await User.countDocuments({});
    const activeProducts = await Product.countDocuments({ published: true });

    const computed = [
      { label: 'Total Revenue', value: `₹${Number(totalRevenue).toLocaleString('en-IN')}` },
      { label: 'Orders', value: String(totalOrders) },
      { label: 'Customers', value: String(totalCustomers) },
      { label: 'Active Products', value: String(activeProducts) },
    ];

    return new Response(JSON.stringify({ kpis: stored, computed }), { status: 200 });
  } catch (err) {
    console.error('GET /api/kpis error', err);
      let stored = [];
      try {
        const q = await Kpi.find();
        if (Array.isArray(q)) stored = q;
        else if (typeof q.sort === 'function') stored = await q.sort({ createdAt: -1 }).lean();
      } catch (e) {
        stored = [];
      }
    return new Response(JSON.stringify({ kpis: stored, computed: [] }), { status: 200 });
  }
}

export async function POST(req) {
  await dbConnect();
  try {
    const body = await req.json();
    const kpi = new Kpi({ label: body.label, value: body.value, createdBy: body.createdBy });
    await kpi.save();
    
    // Emit real-time update to admin
    emitToAdmin('kpi-changed', { 
      action: 'created', 
      kpi: kpi.toObject() 
    });
    
    return new Response(JSON.stringify({ kpi }), { status: 201 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

export async function DELETE(req) {
  await dbConnect();
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return new Response(JSON.stringify({ error: 'id required' }), { status: 400 });
    await Kpi.findByIdAndDelete(id);
    
    // Emit real-time update to admin
    emitToAdmin('kpi-changed', { 
      action: 'deleted', 
      kpiId: id 
    });
    
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

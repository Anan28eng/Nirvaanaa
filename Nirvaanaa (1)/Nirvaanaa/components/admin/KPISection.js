import { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useSocket } from '@/lib/useSocket';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function KPISection() {
  // Real-time KPI state from computed data
  const [kpis, setKpis] = useState({ stored: [], computed: [] });
  const [analytics, setAnalytics] = useState({ revenue: [], orders: [], customers: [] });
  const [range, setRange] = useState('month');
  const { socket } = useSocket();

  const [kpiLoading, setKpiLoading] = useState(false);
  const [kpiError, setKpiError] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState(null);

  const fetchKPIs = async (signal) => {
    setKpiLoading(true);
    setKpiError(null);
    try {
      const res = await fetch('/api/kpis', { signal });
      if (!res.ok) throw new Error('Failed to load KPIs');
      const data = await res.json();
      setKpis(data);
      setKpiLoading(false);
      return data;
    } catch (err) {
      if (err.name === 'AbortError') return;
      console.error('Error fetching KPIs:', err);
      setKpiError(err.message || 'Failed to load KPIs');
      setKpiLoading(false);
      return null;
    }
  };

  const fetchAnalytics = async (r = range, signal) => {
    setAnalyticsLoading(true);
    setAnalyticsError(null);
    try {
      const res = await fetch(`/api/analytics?range=${r}`, { signal });
      if (!res.ok) throw new Error('Failed to load analytics');
      const data = await res.json();
      setAnalytics({ revenue: data.revenue || [], orders: data.orders || [], customers: data.customers || [] });
      setAnalyticsLoading(false);
      return data;
    } catch (err) {
      if (err.name === 'AbortError') return;
      console.error('Error fetching analytics:', err);
      setAnalyticsError(err.message || 'Failed to load analytics');
      setAnalyticsLoading(false);
      return null;
    }
  };

  useEffect(() => {
    const ac = new AbortController();
    fetchKPIs(ac.signal);
    fetchAnalytics(range, ac.signal);
    const interval = setInterval(() => fetchAnalytics(range), 60000); // Refresh every minute
    return () => {
      clearInterval(interval);
      ac.abort();
    };
  }, [range]);

  useEffect(() => {
    if (!socket || typeof socket.on !== 'function') return;

    // Listen for server events to refresh KPIs/analytics
    const onKpiChanged = () => fetchKPIs();
    const onAnalyticsUpdated = () => fetchAnalytics(range);
    const onOrderChanged = () => { fetchAnalytics(range); fetchKPIs(); };
    const onProductChanged = () => fetchKPIs();
    const onCustomerChanged = () => { fetchAnalytics(range); fetchKPIs(); };

    socket.on('kpi-changed', onKpiChanged);
    socket.on('analytics-updated', onAnalyticsUpdated);
    socket.on('order-changed', onOrderChanged);
    socket.on('product-changed', onProductChanged);
    socket.on('customer-changed', onCustomerChanged);

    return () => {
      if (!socket || typeof socket.off !== 'function') return;
      socket.off('kpi-changed', onKpiChanged);
      socket.off('analytics-updated', onAnalyticsUpdated);
      socket.off('order-changed', onOrderChanged);
      socket.off('product-changed', onProductChanged);
      socket.off('customer-changed', onCustomerChanged);
    };
  }, [socket, range]);

  const handleRetry = () => {
    const ac = new AbortController();
    fetchKPIs(ac.signal);
    fetchAnalytics(range, ac.signal);
  };

  // Helper: determine whether a series has any recent (within recencyDays) non-zero datapoint
  const recencyDays = 7; // treat values older than this as seeded/old
  const hasRecentData = (series) => {
    if (!series || !series.length) return false;
    // find last non-zero datapoint
    for (let i = series.length - 1; i >= 0; i--) {
      const v = Number(series[i].value || 0);
      if (v > 0) {
        const parts = series[i].date.split('-');
        const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - (recencyDays - 1));
        return d >= cutoff;
      }
    }
    return false;
  };

  // Helper: extract numeric values from computed KPIs
  const getComputedKPIValue = (label) => {
    const kpi = kpis.computed?.find(k => k.label === label);
    if (!kpi) return 0;
    // Extract number from formatted string (e.g., "₹1,234" -> 1234)
    const num = Number(String(kpi.value).replace(/[^0-9.-]+/g, ''));
    return Number.isFinite(num) ? num : 0;
  };

  const chartOptions = {
    responsive: true,
    animation: {
      duration: 750,
      easing: 'easeInOutQuart'
    },
    scales: {
      y: {
        beginAtZero: true
      }
    },
    plugins: {
      legend: {
        position: 'top'
      }
    }
  };

  const getChartData = (label, data, color) => ({
    labels: data.map(d => (d.date !== undefined ? d.date : d.x)),
    datasets: [{
      label,
      data: data.map(d => (d.value !== undefined ? d.value : d.y)),
      borderColor: color,
      backgroundColor: color + '40',
      tension: 0.4,
      fill: true
    }]
  });

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Real-Time KPI Dashboard</h2>
        <div className="flex items-center gap-3">
          <label className="text-sm text-gray-600">Range</label>
          <select value={range} onChange={(e) => setRange(e.target.value)} className="p-2 border rounded">
            <option value="day">Day</option>
            <option value="week">Week</option>
            <option value="month">Month</option>
            <option value="year">Year</option>
          </select>
        </div>
      </div>

      {/* Current KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {kpiLoading ? (
          <div className="col-span-full text-center text-sm text-gray-500">Loading KPIs...</div>
        ) : kpiError ? (
          <div className="col-span-full p-4 bg-red-50 rounded">
            <div className="text-red-600 text-sm">Failed to load KPIs: {kpiError}</div>
            <button onClick={handleRetry} className="mt-2 px-3 py-1 bg-red-600 text-white rounded">Retry</button>
          </div>
        ) : (
          (() => {
            // Use real-time computed KPIs from the database
            const totalRevenue = getComputedKPIValue('Total Revenue');
            const totalOrders = getComputedKPIValue('Orders');
            const totalCustomers = getComputedKPIValue('Customers');
            const activeProducts = getComputedKPIValue('Active Products');

            const cards = [
              { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString('en-IN')}` },
              { label: 'Orders', value: totalOrders },
              { label: 'Users', value: totalCustomers },
              { label: 'Active Products', value: activeProducts }
            ];

            return cards.map((kpi, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg">
                <h3 className="text-gray-600 text-sm">{kpi.label}</h3>
                <p className="text-2xl font-bold">{kpi.value}</p>
              </div>
            ));
          })()
        )}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Revenue Trend</h3>
          {hasRecentData(analytics.revenue) ? (
            <Line options={chartOptions} data={getChartData('Revenue', analytics.revenue, '#4C51BF')} />
          ) : (
            <div className="text-sm text-gray-500">No recent revenue data for selected range</div>
          )}
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Orders Trend</h3>
          {hasRecentData(analytics.orders) ? (
            <Line options={chartOptions} data={getChartData('Orders', analytics.orders, '#48BB78')} />
          ) : (
            <div className="text-sm text-gray-500">No recent orders data for selected range</div>
          )}
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Customer Growth</h3>
          {hasRecentData(analytics.customers) ? (
            <Line options={chartOptions} data={getChartData('Customers', analytics.customers, '#ED8936')} />
          ) : (
            <div className="text-sm text-gray-500">No recent user data for selected range</div>
          )}
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Active Products</h3>
          <div className="text-sm text-gray-500">Active products is a snapshot KPI shown above.</div>
        </div>
      </div>

      
      {kpis.stored && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4">Custom KPIs</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {kpis.stored.map((kpi) => (
              <div key={kpi._id} className="p-4 bg-gray-50 rounded-lg">
                <h3 className="text-gray-600 text-sm">{kpi.label}</h3>
                <p className="text-2xl font-bold">{kpi.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

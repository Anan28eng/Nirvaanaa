'use client';

import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

export default function TagDiscountManager() {
  const [discounts, setDiscounts] = useState([]);
  const [tag, setTag] = useState('');
  const [percent, setPercent] = useState('');
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      const res = await fetch('/api/tag-discounts');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setDiscounts(data.discounts || []);
    } catch (e) {
      console.error(e);
      toast.error('Failed to load tag discounts');
    }
  };

  useEffect(() => { load(); }, []);

  const save = async (e) => {
    e.preventDefault();
    if (!tag || !percent) return toast.error('Provide tag and percent');
    const pct = Number(percent);
    if (isNaN(pct) || pct < 0 || pct > 100) return toast.error('Percent must be 0-100');
    try {
      setLoading(true);
      const res = await fetch('/api/tag-discounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tag, percent: pct, active: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      toast.success('Tag discount saved');
      setTag('');
      setPercent('');
      await load();
    } catch (e) {
      console.error(e);
      toast.error('Failed to save');
    } finally {
      setLoading(false);
    }
  };

  const remove = async (t) => {
    if (!confirm('Delete this tag discount?')) return;
    try {
      const res = await fetch(`/api/tag-discounts?tag=${encodeURIComponent(t)}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      toast.success('Deleted');
      await load();
    } catch (e) {
      console.error(e);
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Tag-based Discounts</h3>
      <form onSubmit={save} className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tag</label>
          <input
            type="text"
            value={tag}
            onChange={(e) => setTag(e.target.value.toLowerCase())}
            placeholder="e.g. festival"
            className="input"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Discount %</label>
          <input
            type="number"
            min="0"
            max="100"
            value={percent}
            onChange={(e) => setPercent(e.target.value)}
            placeholder="e.g. 15"
            className="input"
          />
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-[#bfae9e] text-white rounded-lg hover:bg-[#7c6a58] transition-colors disabled:opacity-60"
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>

      <div className="mt-4">
        {discounts.length === 0 ? (
          <div className="text-sm text-gray-500">No tag discounts</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-600 border-b">
                  <th className="py-2 pr-4">Tag</th>
                  <th className="py-2 pr-4">Percent</th>
                  <th className="py-2 pr-4">Active</th>
                  <th className="py-2 pr-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {discounts.map((d) => (
                  <tr key={d._id} className="border-b last:border-0">
                    <td className="py-2 pr-4">{d.tag}</td>
                    <td className="py-2 pr-4">{d.percent}%</td>
                    <td className="py-2 pr-4">{d.active ? 'Yes' : 'No'}</td>
                    <td className="py-2 pr-4">
                      <button onClick={() => remove(d.tag)} className="text-red-600 hover:underline">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}



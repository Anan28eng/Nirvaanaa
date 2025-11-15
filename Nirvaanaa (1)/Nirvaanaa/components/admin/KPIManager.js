"use client";
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

export default function KPIManager({ onChange }) {
  const [kpis, setKpis] = useState([]);
  const [label, setLabel] = useState('');
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchKpis = async () => {
    try {
      const res = await fetch('/api/kpis');
      if (!res.ok) throw new Error('Failed to load KPIs');
      const data = await res.json();
      setKpis(data.kpis || []);
      onChange?.(data.kpis || []);
    } catch (err) {
      console.error('Error fetching KPIs:', err);
      toast.error('Failed to load KPIs');
    }
  };

  useEffect(() => { fetchKpis(); }, []);

  const handleAdd = async () => {
    if (!label || !value) return toast.error('Label and value required');
    setLoading(true);
    try {
      const res = await fetch('/api/kpis', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ label, value }) });
      if (!res.ok) throw new Error('Failed to create KPI');
      const data = await res.json();
      setKpis(prev => [data.kpi, ...prev]);
      setLabel(''); setValue('');
      toast.success('KPI added');
      onChange?.([data.kpi, ...kpis]);
    } catch (err) {
      console.error(err);
      toast.error('Failed to add KPI');
    } finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/kpis?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setKpis(prev => prev.filter(k => k._id !== id));
      toast.success('KPI deleted');
      onChange?.(kpis.filter(k => k._id !== id));
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete KPI');
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">KPIs</h3>
      <div className="flex gap-2">
        <input value={label} onChange={e=>setLabel(e.target.value)} placeholder="Label" className="input" />
        <input value={value} onChange={e=>setValue(e.target.value)} placeholder="Value" className="input" />
        <button onClick={handleAdd} disabled={loading} className="btn">Add</button>
      </div>
      <ul className="space-y-2">
        {kpis.map(k => (
          <li key={k._id} className="flex items-center justify-between">
            <div>{k.label}: <strong>{k.value}</strong></div>
            <div>
              <button onClick={()=>handleDelete(k._id)} disabled={loading} className="btn-outline">Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

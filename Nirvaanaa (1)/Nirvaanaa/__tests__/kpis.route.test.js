import { GET } from '@/app/api/kpis/route';

jest.mock('@/lib/mongodb', () => jest.fn());
jest.mock('@/models/Kpi', () => ({ find: jest.fn().mockResolvedValue([]) }));
jest.mock('@/models/Order', () => ({ aggregate: jest.fn().mockResolvedValue([{ total: 1000, orders: 5 }]) }));
jest.mock('@/models/User', () => ({ countDocuments: jest.fn().mockResolvedValue(10) }));
jest.mock('@/models/Product', () => ({ countDocuments: jest.fn().mockResolvedValue(20) }));

describe('GET /api/kpis', () => {
  it('returns computed KPIs with total revenue and counts', async () => {
    const res = await GET();
    const text = await res.text();
    const json = JSON.parse(text);
    expect(Array.isArray(json.kpis)).toBeTruthy();
    expect(Array.isArray(json.computed)).toBeTruthy();
    const labels = json.computed.map(c => c.label);
    expect(labels).toContain('Total Revenue');
    expect(labels).toContain('Orders');
  });
});

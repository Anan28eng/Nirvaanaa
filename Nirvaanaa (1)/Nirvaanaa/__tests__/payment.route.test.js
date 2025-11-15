jest.mock('@/lib/mongodb', () => jest.fn());

jest.mock('@/models/Order', () => {
  const findByIdAndUpdate = jest.fn().mockResolvedValue({ _id: 'ord123' });
  return {
    __esModule: true,
    default: { findByIdAndUpdate },
  };
});

describe('POST /api/payment (dummy)', () => {
  it('updates order and returns redirect to checkout success', async () => {
    const { POST } = require('@/app/api/payment/route');
    const req = { json: async () => ({ orderId: 'ord123', userId: 'user_1', amount: 2500 }) };
    const res = await POST(req);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.redirectUrl).toBe('/checkout/success?orderId=ord123');
    const Order = require('@/models/Order').default;
    expect(Order.findByIdAndUpdate).toHaveBeenCalledWith('ord123', expect.objectContaining({ status: 'paid' }));
  });
});



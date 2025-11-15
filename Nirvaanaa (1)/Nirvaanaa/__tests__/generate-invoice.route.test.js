// Mock Mongo connection
jest.mock('@/lib/mongodb', () => jest.fn());

// Mock models without referencing outer-scope variables
jest.mock('@/models/Order', () => {
  const order = {
    _id: 'order123',
    orderNumber: 'NIR-1001',
    createdAt: new Date().toISOString(),
    shippingMethod: 'Standard Shipping',
    total: 1999,
    items: [
      { name: 'Silk Saree', price: 1299, quantity: 1 },
      { name: 'Blouse Piece', price: 299, quantity: 1 },
    ],
    shippingAddress: {
      name: 'Test User',
      street: '123 Main St', city: 'Bengaluru', state: 'KA', zipCode: '560001', country: 'India',
    },
    userId: { id: 'user1', name: 'Test User', email: 'test@example.com' },
  };
  return {
    __esModule: true,
    default: {
      findById: jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(order),
      }),
    },
  };
});

jest.mock('@/models/InvoiceTemplate', () => ({
  __esModule: true,
  default: {
    findOne: jest.fn().mockReturnValue({ sort: jest.fn().mockResolvedValue({ path: 'ignored.docx' }) }),
  },
}));

// Mock invoice utils to avoid libreoffice/docxtemplater
jest.mock('@/utils/invoice', () => ({
  renderDocxTemplateToBuffer: jest.fn().mockResolvedValue(Buffer.from('DOCX_PLACEHOLDER')),
  convertDocxBufferToPdfBuffer: jest.fn().mockResolvedValue(Buffer.from('%PDF-1.4 TEST')),
  buildInvoicePlaceholders: jest.fn().mockReturnValue({
    customer_name: 'Test User',
    customer_address: '123 Main St, Bengaluru, KA, 560001, India',
    order_date: new Date().toLocaleDateString(),
    shipping_method: 'Standard Shipping',
    product_table: '<tr><td>Silk Saree</td><td>1</td><td>₹1299</td><td>₹1299</td></tr>',
    total_price: '₹1999',
  }),
}));

// Mock nodemailer to avoid sending emails
const sendMail = jest.fn().mockResolvedValue({});
jest.mock('nodemailer', () => ({
  __esModule: true,
  default: {
    createTransport: jest.fn().mockReturnValue({ sendMail }),
  },
}));

describe('POST /api/generate-invoice', () => {
  let POST;
  const OLD_ENV = process.env;
  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV,
      EMAIL_SERVER_HOST: 'smtp.example.com',
      EMAIL_SERVER_PORT: '587',
      EMAIL_SERVER_USER: 'no-reply@example.com',
      EMAIL_SERVER_PASSWORD: 'pass',
      ADMIN_EMAILS: 'admin1@example.com, admin2@example.com',
    };
    sendMail.mockClear();
    // Import after mocks
    POST = require('@/app/api/generate-invoice/route').POST;
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  it('returns a PDF response and emails admins (libs mocked)', async () => {
    const req = { json: async () => ({ orderId: 'order123' }) };
    const res = await POST(req);

    // Headers
    expect(res.headers.get('Content-Type')).toBe('application/pdf');
    expect(res.headers.get('Content-Disposition')).toContain('invoice-');

    // Body
    const buf = Buffer.from(await res.arrayBuffer());
    expect(buf.length).toBeGreaterThan(0);
    expect(buf.toString()).toContain('%PDF-1.4');

    // Email
    expect(sendMail).toHaveBeenCalled();
    const args = sendMail.mock.calls[0][0];
    expect(args.to).toEqual(['admin1@example.com', 'admin2@example.com']);
    expect(args.attachments?.[0]?.filename).toContain('invoice-');
    expect(Buffer.isBuffer(args.attachments?.[0]?.content)).toBe(true);
  });
});



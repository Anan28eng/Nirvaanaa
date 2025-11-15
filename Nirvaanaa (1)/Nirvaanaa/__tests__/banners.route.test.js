import { GET } from '@/app/api/banners/route';

jest.mock('@/lib/mongodb', () => jest.fn());
jest.mock('@/models/Announcement', () => ({
  findAdBanner: jest.fn().mockResolvedValue({ _id: 'ad1', type: 'adbanner', text: 'sale', isAdBannerActive: true }),
  findAnnouncementBanner: jest.fn().mockResolvedValue({ _id: 'ann1', type: 'announcement', image: 'http://img', isAnnouncementActive: true }),
  findOne: jest.fn().mockResolvedValue(null),
}));

describe('GET /api/banners', () => {
  it('returns banners object with ad and announcement', async () => {
    const res = await GET();
    const text = await res.text();
    const json = JSON.parse(text);
    expect(json.banners).toBeDefined();
    expect(json.banners.ad).toBeTruthy();
    expect(json.banners.announcement).toBeTruthy();
  });
});

// @ts-nocheck
import { EbooksService } from '@/services/EbooksService';

jest.mock('@/services/supabaseClient', () => ({
  supabase: {
    storage: {
      from: () => ({
        createSignedUrl: jest.fn(async (path: string) => ({ data: { signedUrl: `https://signed/${path}` }, error: null }))
      })
    }
  }
}));

describe('EbooksService', () => {
  it('returns a signed URL (placeholder)', async () => {
    const url = await EbooksService.getSignedFileUrl('files/mybook.epub');
    expect(typeof url).toBe('string');
  });
});


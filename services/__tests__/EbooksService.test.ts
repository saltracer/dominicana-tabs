// @ts-nocheck
import { EbooksService } from '@/services/EbooksService';

jest.mock('@/services/supabaseClient', () => ({
  supabase: {
    from: () => ({
      select: () => ({ order: () => ({ data: [], error: null }) })
    }),
    storage: {
      from: () => ({
        createSignedUrl: jest.fn(async (path: string) => ({ data: { signedUrl: `https://signed/${path}` }, error: null }))
      })
    }
  }
}));

describe('EbooksService', () => {
  it('returns a signed URL', async () => {
    const url = await EbooksService.getSignedFileUrl('files/mybook.epub');
    expect(url).toContain('https://signed/files/mybook.epub');
  });

  it('lists books without throwing', async () => {
    const list = await EbooksService.listBooks();
    expect(Array.isArray(list)).toBe(true);
  });
});


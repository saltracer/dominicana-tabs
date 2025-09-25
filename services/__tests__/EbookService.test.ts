import EbookService from '../EbookService';

jest.mock('../supabaseClient', () => ({ __esModule: true, default: undefined }));

test('EbookService.getBookMetadata returns fallback when supabase undefined', async () => {
  const data = await EbookService.getBookMetadata('book-x');
  expect(data.id).toBe('book-x');
  expect(data.title).toBeTruthy();
  expect(data.author).toBeTruthy();
  expect(data.epubUrl).toBeTruthy();
});
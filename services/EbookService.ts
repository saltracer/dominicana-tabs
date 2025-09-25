import type { Ebook, ReaderLocator, ReadingSessionState } from '../types/ebook';
import supabase from './supabaseClient';

// Placeholder implementations to be replaced with real Supabase client calls.
// The real app should import a configured Supabase client and use row-level
// security to fetch book metadata and generate signed URLs for private files.

export class EbookService {
  static async getBookMetadata(bookId: string): Promise<Ebook> {
    if (supabase) {
      const { data, error } = await supabase
        .from('ebooks')
        .select('id,title,author,description,cover_image_url,epub_path,sample_epub_path,is_dominican')
        .eq('id', bookId)
        .single();
      if (!error && data) {
        return {
          id: data.id,
          title: data.title,
          author: data.author,
          description: data.description ?? undefined,
          coverImageUrl: data.cover_image_url ?? undefined,
          // Defer URL signing until getEpubUrl
          tags: [],
          isDominican: !!data.is_dominican,
          // Surface storage paths internally for URL signing stage
          ...(data.epub_path ? { epubUrl: undefined, epub_path: data.epub_path } : {} as any),
        };
      }
    }
    // Fallback stub
    return {
      id: bookId,
      title: 'Sample Book',
      author: 'Sample Author',
      description: 'Sample description for the selected book.',
      coverImageUrl: undefined,
      epubUrl: 'https://example.com/sample.epub',
      tags: ['sample'],
      isDominican: false,
    };
  }

  static async getEpubUrl(ebook: Ebook): Promise<string> {
    if (ebook.epubUrl) return ebook.epubUrl;

    const withPath = ebook as any;
    if (supabase && withPath.epub_path) {
      const path = withPath.epub_path as string;
      const { data, error } = await (supabase as any).storage.from('ebooks').createSignedUrl(path, 3600);
      if (!error && data?.signedUrl) return data.signedUrl as string;
    }
    throw new Error('No EPUB URL available for this ebook');
  }

  static async saveReadingLocator(ebookId: string, locator: ReaderLocator): Promise<void> {
    if (supabase) {
      // Persist locator in user progress table (assuming RLS uses auth.uid())
      await supabase.from('ebook_progress').upsert({ ebook_id: ebookId, locator });
      return;
    }
  }

  static async getReadingSession(ebookId: string): Promise<ReadingSessionState | undefined> {
    if (supabase) {
      const { data, error } = await supabase
        .from('ebook_progress')
        .select('locator, updated_at')
        .eq('ebook_id', ebookId)
        .single();
      if (!error && data) {
        return {
          ebookId,
          lastLocator: data.locator ?? undefined,
          updatedAt: data.updated_at ?? new Date().toISOString(),
        } as any;
      }
    }
    return undefined;
  }
}

export default EbookService;


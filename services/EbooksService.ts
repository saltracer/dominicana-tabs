// @ts-nocheck
import { supabase } from './supabaseClient';

type DbBook = {
  id: string;
  slug: string;
  title: string;
  author?: string;
  description?: string;
  cover_path?: string;
  file_path?: string;
  language?: string;
  tags?: string[];
};

export class EbooksService {
  static async listBooks(): Promise<DbBook[]> {
    const { data, error } = await supabase
      .from('books')
      .select('id, slug, title, author, description, cover_path, file_path, language, tags')
      .order('title', { ascending: true });
    if (error) throw error;
    return data ?? [];
  }

  static async getBookById(idOrSlug: string): Promise<DbBook | null> {
    const query = supabase
      .from('books')
      .select('id, slug, title, author, description, cover_path, file_path, language, tags')
      .limit(1);
    const { data, error } = idOrSlug.match(/^[0-9a-fA-F-]{36}$/)
      ? await query.eq('id', idOrSlug)
      : await query.eq('slug', idOrSlug);
    if (error) throw error;
    return data && data.length ? data[0] : null;
  }

  static async getSignedFileUrl(filePath: string, expiresInSeconds: number = 3600): Promise<string> {
    const { data, error } = await supabase.storage
      .from('ebooks')
      .createSignedUrl(filePath, expiresInSeconds);
    if (error || !data?.signedUrl) throw error || new Error('Failed to sign URL');
    return data.signedUrl;
  }
}


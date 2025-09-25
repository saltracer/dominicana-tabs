// @ts-nocheck
import { supabase } from './supabaseClient';
import { Book } from '@/types';

export class EbooksService {
  static async listBooks(): Promise<Book[]> {
    // TODO: replace with real supabase query
    return [] as any;
  }

  static async getBookById(id: string): Promise<Book | null> {
    // TODO: replace with real supabase query
    return null;
  }

  static async getSignedFileUrl(filePath: string): Promise<string> {
    // TODO: replace with supabase storage signed URL
    return `/secure/${encodeURIComponent(filePath)}`;
  }
}


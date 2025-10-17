import { supabase } from '../lib/supabase';
import { Book, BookCategory } from '../types';

export interface BookFilters {
  search?: string;
  category?: BookCategory;
  sortBy?: 'title' | 'author' | 'year' | 'created_at' | 'published_at';
  sortOrder?: 'asc' | 'desc';
  publishedStatus?: 'all' | 'published' | 'draft';
}

export interface BookPagination {
  page: number;
  limit: number;
}

export interface BookListResponse {
  books: Book[];
  total: number;
  page: number;
  totalPages: number;
}

export interface CreateBookData {
  title: string;
  author: string;
  year?: string;
  categories: string[]; // Changed to array - must have 1-10 categories
  description: string;
  long_description?: string[];
  published?: boolean;
}

/**
 * Admin service for managing books
 * Uses service role key for elevated permissions
 */
export class AdminBookService {
  /**
   * List books with filters and pagination
   */
  static async listBooks(
    filters: BookFilters = {},
    pagination: BookPagination = { page: 1, limit: 50 }
  ): Promise<BookListResponse> {
    const { page, limit } = pagination;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('books')
      .select('*', { count: 'exact' });

    // Apply search filter
    if (filters.search) {
      query = query.or(
        `title.ilike.%${filters.search}%,author.ilike.%${filters.search}%`
      );
    }

    // Apply category filter - check if book's categories array contains this category
    if (filters.category) {
      query = query.contains('categories', [filters.category]);
    }

    // Apply published status filter
    if (filters.publishedStatus && filters.publishedStatus !== 'all') {
      if (filters.publishedStatus === 'published') {
        query = query.eq('published', true);
      } else if (filters.publishedStatus === 'draft') {
        query = query.eq('published', false);
      }
    }

    // Apply sorting
    const sortBy = filters.sortBy || 'created_at';
    const sortOrder = filters.sortOrder || 'desc';
    const ascending = sortOrder === 'asc';

    // For year sorting, handle nulls
    if (sortBy === 'year') {
      query = query.order('year', { ascending, nullsFirst: !ascending });
    } else if (sortBy === 'published_at') {
      query = query.order('published_at', { ascending, nullsFirst: !ascending });
    } else {
      query = query.order(sortBy, { ascending });
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Error listing books:', error);
      throw new Error(`Failed to list books: ${error.message}`);
    }

    const books = (data || []).map(this.transformBook);
    const total = count || 0;
    const totalPages = Math.ceil(total / limit);

    return {
      books,
      total,
      page,
      totalPages,
    };
  }

  /**
   * Get a single book by ID
   */
  static async getBook(id: number): Promise<Book> {
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error getting book:', error);
      throw new Error(`Failed to get book: ${error.message}`);
    }

    return this.transformBook(data);
  }

  /**
   * Create a new book with optional files
   */
  static async createBook(
    bookData: CreateBookData,
    files?: {
      cover?: File | Blob;
      epub?: File | Blob;
      epubSample?: File | Blob;
    }
  ): Promise<Book> {
    // Validate categories
    if (!bookData.categories || bookData.categories.length === 0) {
      throw new Error('At least one category is required');
    }
    if (bookData.categories.length > 10) {
      throw new Error('Maximum 10 categories allowed');
    }
    // Remove duplicates while preserving order
    const uniqueCategories = Array.from(new Set(bookData.categories));

    // First create the book record
    const { data, error } = await supabase
      .from('books')
      .insert({
        title: bookData.title,
        author: bookData.author,
        year: bookData.year || null,
        categories: uniqueCategories,
        description: bookData.description,
        long_description: bookData.long_description || null,
        published: bookData.published || false, // Default to draft
        published_at: bookData.published ? new Date().toISOString() : null, // Set timestamp if publishing immediately
        cover_image: null,
        epub_path: null,
        epub_sample_path: null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating book:', error);
      throw new Error(`Failed to create book: ${error.message}`);
    }

    const bookId = data.id;

    // Upload files if provided
    try {
      if (files?.cover) {
        await this.uploadCoverImage(files.cover, bookId);
      }
      if (files?.epub) {
        await this.uploadEpubFile(files.epub, bookId, false);
      }
      if (files?.epubSample) {
        await this.uploadEpubFile(files.epubSample, bookId, true);
      }
    } catch (uploadError) {
      console.error('Error uploading files:', uploadError);
      // Book is created, but files failed - don't throw, just warn
      console.warn('Book created but some files failed to upload');
    }

    // Fetch the updated book with file URLs
    return this.getBook(bookId);
  }

  /**
   * Update a book
   */
  static async updateBook(
    id: number,
    updates: Partial<CreateBookData>
  ): Promise<Book> {
    // Validate categories if provided
    if (updates.categories !== undefined) {
      if (!updates.categories || updates.categories.length === 0) {
        throw new Error('At least one category is required');
      }
      if (updates.categories.length > 10) {
        throw new Error('Maximum 10 categories allowed');
      }
      // Remove duplicates while preserving order
      updates.categories = Array.from(new Set(updates.categories));
    }

    const { data, error } = await supabase
      .from('books')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating book:', error);
      throw new Error(`Failed to update book: ${error.message}`);
    }

    return this.transformBook(data);
  }

  /**
   * Delete a book
   */
  static async deleteBook(id: number): Promise<void> {
    const { error } = await supabase
      .from('books')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting book:', error);
      throw new Error(`Failed to delete book: ${error.message}`);
    }
  }

  /**
   * Upload EPUB file to storage
   */
  static async uploadEpubFile(
    file: File | Blob,
    bookId: number,
    isSample: boolean = false
  ): Promise<string> {
    const fileName = `${bookId}${isSample ? '-sample' : ''}.epub`;
    const filePath = `books/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('epub_files')
      .upload(filePath, file, {
        upsert: true,
        contentType: 'application/epub+zip',
      });

    if (uploadError) {
      console.error('Error uploading EPUB:', uploadError);
      throw new Error(`Failed to upload EPUB: ${uploadError.message}`);
    }

    // Get public URL
    const { data } = supabase.storage
      .from('epub_files')
      .getPublicUrl(filePath);

    // Update book record
    const updateField = isSample ? 'epub_sample_path' : 'epub_path';
    await supabase
      .from('books')
      .update({ [updateField]: data.publicUrl })
      .eq('id', bookId);

    return data.publicUrl;
  }

  /**
   * Upload cover image to storage
   */
  static async uploadCoverImage(
    file: File | Blob,
    bookId: number
  ): Promise<string> {
    const fileName = `${bookId}.jpg`;
    const filePath = `covers/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('book_covers')
      .upload(filePath, file, {
        upsert: true,
        contentType: 'image/jpeg',
      });

    if (uploadError) {
      console.error('Error uploading cover:', uploadError);
      throw new Error(`Failed to upload cover: ${uploadError.message}`);
    }

    // Get public URL
    const { data } = supabase.storage
      .from('book_covers')
      .getPublicUrl(filePath);

    // Update book record
    await supabase
      .from('books')
      .update({ cover_image: data.publicUrl })
      .eq('id', bookId);

    return data.publicUrl;
  }

  /**
   * Delete EPUB file from storage
   */
  static async deleteEpubFile(bookId: number, isSample: boolean = false): Promise<void> {
    const fileName = `${bookId}${isSample ? '-sample' : ''}.epub`;
    const filePath = `books/${fileName}`;

    const { error } = await supabase.storage
      .from('epub_files')
      .remove([filePath]);

    if (error) {
      console.error('Error deleting EPUB:', error);
      // Don't throw - file might not exist
    }

    // Update book record
    const updateField = isSample ? 'epub_sample_path' : 'epub_path';
    await supabase
      .from('books')
      .update({ [updateField]: null })
      .eq('id', bookId);
  }

  /**
   * Delete cover image from storage
   */
  static async deleteCoverImage(bookId: number): Promise<void> {
    const fileName = `${bookId}.jpg`;
    const filePath = `covers/${fileName}`;

    const { error } = await supabase.storage
      .from('book_covers')
      .remove([filePath]);

    if (error) {
      console.error('Error deleting cover:', error);
      // Don't throw - file might not exist
    }

    // Update book record
    await supabase
      .from('books')
      .update({ cover_image: null })
      .eq('id', bookId);
  }

  /**
   * Publish a book (make it visible in library)
   */
  static async publishBook(id: number): Promise<void> {
    const { error } = await supabase
      .from('books')
      .update({ 
        published: true,
        published_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      console.error('Error publishing book:', error);
      throw new Error(`Failed to publish book: ${error.message}`);
    }
  }

  /**
   * Unpublish a book (hide from library and clear published date)
   */
  static async unpublishBook(id: number): Promise<void> {
    const { error } = await supabase
      .from('books')
      .update({ 
        published: false,
        published_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      console.error('Error unpublishing book:', error);
      throw new Error(`Failed to unpublish book: ${error.message}`);
    }
  }

  /**
   * Transform database book to app book format
   */
  private static transformBook(dbBook: any): Book {
    return {
      id: dbBook.id,
      title: dbBook.title,
      author: dbBook.author,
      year: dbBook.year,
      categories: dbBook.categories || [], // Array of categories
      coverImage: dbBook.cover_image,
      description: dbBook.description,
      longDescription: dbBook.long_description,
      epubPath: dbBook.epub_path,
      epubSamplePath: dbBook.epub_sample_path,
      published: dbBook.published || false,
      publishedAt: dbBook.published_at,
      createdAt: dbBook.created_at,
      updatedAt: dbBook.updated_at,
    };
  }
}



export interface Ebook {
  id: string;
  title: string;
  author: string;
  description?: string;
  language?: string;
  coverImageUrl?: string;
  epubUrl?: string;        // public URL or signed URL for the full book
  sampleEpubUrl?: string;  // optional sample preview URL
  tags?: string[];
  isDominican?: boolean;
}

export interface ReaderLocator {
  href: string;            // resource href inside the publication
  type?: string;           // media type
  title?: string;          // optional title of the resource
  locations?: {
    cfi?: string;          // EPUB CFI when available
    position?: number;     // position index
    progression?: number;  // 0..1 progression in resource
  };
}

export interface ReaderSettings {
  appearance?: 'light' | 'dark' | 'sepia';
  fontSizePercent?: number;        // 50..200
  fontFamily?: string;
  lineHeight?: number;
  pageMargins?: number;
}

export interface ReadingSessionState {
  ebookId: string;
  lastLocator?: ReaderLocator;
  updatedAt: string;
}


# EPUB Reading Implementation

This document describes the implementation of EPUB reading functionality in the Dominicana app using the `react-native-readium` library.

## Overview

The EPUB reading functionality allows authenticated users to read books directly within the app instead of just downloading them. Unauthenticated users can still view book information but cannot access the reading functionality.

## Architecture

### Components

1. **EpubReader** (`components/EpubReader.tsx`) - Main EPUB reader component for mobile
2. **EpubReader.web** (`components/EpubReader.web.tsx`) - Web-compatible version with download fallback
3. **BookDetailScreen** - Updated to include reading functionality alongside download

### Key Features

- **Authentication-gated access**: Only logged-in users can read books
- **Cross-platform support**: Native reading on mobile, download fallback on web
- **Error handling**: Graceful handling of loading errors and missing files
- **Retry functionality**: Users can retry loading if initial attempt fails
- **Responsive UI**: Loading states and error messages

## Implementation Details

### Dependencies

```json
{
  "react-native-readium": "^4.0.1"
}
```

### Database Schema

The implementation uses the existing `books` table with the following relevant fields:

```sql
CREATE TABLE books (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  year TEXT,
  category TEXT NOT NULL,
  cover_image TEXT,
  description TEXT NOT NULL,
  epub_path TEXT,           -- Full EPUB file path
  epub_sample_path TEXT,    -- Sample/preview path
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### File Storage

EPUB files are stored in Supabase Storage under the `epub_files` bucket with the following structure:
- **Bucket**: `epub_files`
- **Path format**: `public/{book-id}/{filename}.epub`
- **Access**: Private (requires signed URLs for access)

### Authentication Flow

1. **Unauthenticated users**: See book information and login prompt
2. **Authenticated users**: Can read books directly or download them
3. **File access**: Uses Supabase signed URLs with 1-hour expiry

## Component Usage

### EpubReader Component

```typescript
import { EpubReader } from '../components/EpubReader';

<EpubReader 
  book={bookObject} 
  onClose={() => setShowReader(false)} 
/>
```

**Props:**
- `book`: Book object with epubPath
- `onClose`: Callback when reader is closed

### Book Detail Screen Integration

The book detail screen now includes:

1. **Read Button**: Opens the EPUB reader
2. **Download Button**: Downloads the EPUB file
3. **Authentication Check**: Shows appropriate UI based on login status

## Platform-Specific Behavior

### Mobile (iOS/Android)
- Uses `react-native-readium` for native EPUB reading
- Full reading experience with navigation, bookmarks, etc.
- Optimized for touch interaction

### Web
- Shows placeholder with download option
- Explains that EPUB reading requires download
- Provides direct download link

## Error Handling

### Loading States
- Initial loading with progress indicator
- File URL generation with retry capability
- Network error handling

### Error Scenarios
1. **No EPUB file available**: Shows appropriate message
2. **Authentication required**: Prompts for login
3. **Network errors**: Retry functionality
4. **Invalid file**: Error message with retry option

## Testing

### Unit Tests
- `__tests__/epub-reader.test.ts`: Tests for EpubReader component
- `__tests__/book-detail-epub.test.ts`: Tests for book detail integration

### Test Coverage
- Component rendering in different states
- Error handling scenarios
- User interaction flows
- Authentication state handling

## Security Considerations

### File Access
- EPUB files are stored privately in Supabase Storage
- Access requires authentication and signed URLs
- URLs expire after 1 hour for security

### User Permissions
- Only authenticated users can access reading functionality
- File paths are validated before generating signed URLs
- No direct file access without proper authentication

## Performance Considerations

### File Loading
- Signed URLs are generated on-demand
- 1-hour expiry balances security and performance
- Retry mechanism for failed loads

### Memory Management
- Reader component is unmounted when closed
- No persistent file caching (security requirement)
- Efficient error state management

## Future Enhancements

### Potential Improvements
1. **Reading Progress**: Track and save reading position
2. **Bookmarks**: Allow users to bookmark pages
3. **Offline Reading**: Cache books for offline access
4. **Reading Preferences**: Font size, theme, etc.
5. **Search**: Full-text search within books

### Technical Debt
- Consider implementing proper EPUB metadata parsing
- Add support for different EPUB versions
- Implement reading analytics
- Add accessibility features

## Troubleshooting

### Common Issues

1. **"No EPUB file available"**
   - Check if `epubPath` is set in the book record
   - Verify file exists in Supabase Storage

2. **"Authentication Required"**
   - Ensure user is logged in
   - Check session validity

3. **"Failed to load EPUB file"**
   - Check network connectivity
   - Verify Supabase Storage permissions
   - Try retry functionality

### Debug Information

The implementation includes console logging for:
- File path extraction
- Signed URL generation
- Error states
- User interactions

## Configuration

### Environment Variables
- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_ANON_KEY`: Public anon key
- Storage bucket: `epub_files`

### Supabase Setup
1. Create `epub_files` bucket
2. Set bucket to private
3. Configure RLS policies for authenticated access
4. Upload EPUB files to bucket

## API Reference

### EpubReader Props
```typescript
interface EpubReaderProps {
  book: Book;
  onClose: () => void;
}
```

### Book Interface
```typescript
interface Book {
  id: number;
  title: string;
  author: string;
  year?: string;
  category: string;
  coverImage?: string;
  description: string;
  epubPath?: string;
  epubSamplePath?: string;
  createdAt: string;
  updatedAt: string;
}
```

## Conclusion

The EPUB reading implementation provides a seamless reading experience for authenticated users while maintaining security and cross-platform compatibility. The modular design allows for easy extension and maintenance.

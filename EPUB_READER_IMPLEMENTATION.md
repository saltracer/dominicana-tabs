# EPUB Reader Implementation

This document describes the implementation of EPUB reading functionality in the Dominicana app using the `react-native-readium` library.

## Overview

The implementation adds EPUB reading capabilities to the existing book download functionality. Users can now read books directly within the app when logged in, while unauthenticated users can view book information.

## Architecture

### Components

1. **EpubReader** (`components/EpubReader.tsx`) - Main reader component for mobile
2. **EpubReader.web** (`components/EpubReader.web.tsx`) - Web-compatible reader component
3. **Book Detail Pages** - Updated to include reading functionality

### Key Features

- **Authentication-based access**: Only logged-in users can read books
- **Fallback to download**: Users can still download books for external reading
- **Error handling**: Graceful handling of loading errors and missing files
- **Cross-platform**: Separate implementations for mobile and web

## Implementation Details

### 1. Library Installation

```bash
npm install react-native-readium
```

The `react-native-readium` library provides:
- Native EPUB rendering on mobile devices
- Cross-platform compatibility
- Integration with React Native components

### 2. EpubReader Component

The main reader component handles:

- **File Loading**: Generates signed URLs for Supabase storage access
- **Error Handling**: Displays appropriate error messages
- **Loading States**: Shows loading indicators during file operations
- **Navigation**: Provides back button to return to book details

#### Key Methods

```typescript
const loadEpubFile = async () => {
  // Extract file path from Supabase URL
  // Generate signed URL for private access
  // Handle errors gracefully
};

const handleRetry = () => {
  // Retry loading the EPUB file
};
```

### 3. Book Detail Page Integration

The book detail pages (`app/(tabs)/study/book/[id].tsx` and `.web.tsx`) were updated to:

- **Add Read Button**: Primary action for logged-in users
- **Maintain Download**: Secondary action for external reading
- **Conditional Rendering**: Show reader or book info based on authentication
- **State Management**: Handle reader visibility state

#### Updated UI Flow

```
Book Detail Page
├── Authenticated Users
│   ├── Read Book Button (Primary)
│   ├── Download EPUB Button (Secondary)
│   └── EPUB Reader (when reading)
└── Unauthenticated Users
    ├── Book Information
    └── Login Prompt
```

### 4. Web Compatibility

The web version (`EpubReader.web.tsx`) provides:

- **Placeholder Interface**: Since web EPUB reading is not fully implemented
- **Download Fallback**: Direct download functionality for web users
- **Consistent UX**: Maintains the same interface as mobile

## Data Flow

### 1. User Authentication Check

```typescript
const { user } = useAuth();
if (user) {
  // Show read/download options
} else {
  // Show book info and login prompt
}
```

### 2. EPUB File Access

```typescript
// Extract file path from Supabase URL
const urlPath = book.epubPath;
const filePath = extractFilePath(urlPath);

// Generate signed URL for private access
const { data: signedUrlData } = await supabase.storage
  .from('epub_files')
  .createSignedUrl(filePath, 3600);
```

### 3. Reader Component Rendering

```typescript
if (showReader && book) {
  return <EpubReader book={book} onClose={handleCloseReader} />;
}
```

## Database Schema

The implementation uses the existing `books` table with these relevant fields:

```sql
CREATE TABLE books (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  epub_path TEXT,           -- Full EPUB file path
  epub_sample_path TEXT,    -- Sample/preview path
  -- ... other fields
);
```

## Security Considerations

### 1. Authentication Required

- Only authenticated users can access the reader
- Unauthenticated users see book information only
- No direct access to EPUB files without authentication

### 2. Signed URLs

- EPUB files are stored in private Supabase storage
- Signed URLs provide temporary access (1 hour expiry)
- URLs are generated server-side for security

### 3. File Access Control

```typescript
// Generate signed URL for private storage access
const { data: signedUrlData, error: signedUrlError } = await supabase.storage
  .from('epub_files')
  .createSignedUrl(filePath, 3600); // 1 hour expiry
```

## Testing

### Unit Tests

- **EpubReader Component**: Tests loading, error handling, and user interactions
- **Book Detail Integration**: Tests authentication flow and reader integration
- **Error Scenarios**: Tests various failure modes

### Test Coverage

- Component rendering in different states
- User authentication flows
- Error handling and retry functionality
- Cross-platform compatibility

## Configuration Requirements

### iOS Setup

The `react-native-readium` library requires iOS 13.0+ and specific Podfile configuration:

```ruby
platform :ios, '13.0'

target 'YourApp' do
  config = use_native_modules!
  pod 'GCDWebServer', podspec: 'https://raw.githubusercontent.com/readium/GCDWebServer/3.7.5/GCDWebServer.podspec', modular_headers: true
  pod 'R2Navigator', podspec: 'https://raw.githubusercontent.com/readium/swift-toolkit/2.6.0/Support/CocoaPods/ReadiumNavigator.podspec'
  pod 'R2Shared', podspec: 'https://raw.githubusercontent.com/readium/swift-toolkit/2.6.0/Support/CocoaPods/ReadiumShared.podspec'
  pod 'R2Streamer', podspec: 'https://raw.githubusercontent.com/readium/swift-toolkit/2.6.0/Support/CocoaPods/ReadiumStreamer.podspec'
  pod 'ReadiumInternal', podspec: 'https://raw.githubusercontent.com/readium/swift-toolkit/2.6.0/Support/CocoaPods/ReadiumInternal.podspec'
  pod 'Minizip', modular_headers: true
end
```

### Android Setup

Requires `compileSdkVersion` 31 or higher in `android/build.gradle`:

```gradle
buildscript {
    ext {
        compileSdkVersion = 31
        // other configurations
    }
}
```

## Usage Examples

### Basic Usage

```typescript
import { EpubReader } from '../components/EpubReader';

const MyComponent = () => {
  const [showReader, setShowReader] = useState(false);
  
  return (
    <>
      {showReader && (
        <EpubReader 
          book={book} 
          onClose={() => setShowReader(false)} 
        />
      )}
    </>
  );
};
```

### Integration with Book Detail

```typescript
const handleReadBook = () => {
  if (!book?.epubPath) {
    Alert.alert('Reading Unavailable', 'This book is not available for reading.');
    return;
  }
  setShowReader(true);
};
```

## Future Enhancements

### Planned Features

1. **Reading Progress Tracking**: Save and restore reading position
2. **Bookmarks**: Allow users to bookmark pages
3. **Annotations**: Enable highlighting and note-taking
4. **Offline Reading**: Cache books for offline access
5. **Web EPUB Support**: Full web-based EPUB reading

### Technical Improvements

1. **Performance Optimization**: Lazy loading and caching
2. **Accessibility**: Screen reader support and keyboard navigation
3. **Customization**: Font size, theme, and reading preferences
4. **Analytics**: Reading behavior tracking and insights

## Troubleshooting

### Common Issues

1. **EPUB File Not Loading**
   - Check file path in database
   - Verify Supabase storage permissions
   - Ensure signed URL generation is working

2. **Reader Not Displaying**
   - Check iOS/Android configuration
   - Verify react-native-readium installation
   - Check for platform-specific issues

3. **Authentication Issues**
   - Verify user login state
   - Check Supabase authentication setup
   - Ensure proper error handling

### Debug Steps

1. Check console logs for error messages
2. Verify EPUB file accessibility
3. Test signed URL generation
4. Check component rendering states
5. Validate authentication flow

## Conclusion

The EPUB reader implementation provides a seamless reading experience for authenticated users while maintaining security and providing fallback options. The modular design allows for easy maintenance and future enhancements.

The implementation successfully integrates with the existing codebase while adding new functionality without breaking existing features. The cross-platform approach ensures consistent user experience across different devices and platforms.
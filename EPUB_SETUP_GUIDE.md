# EPUB Reading Setup Guide

This guide provides step-by-step instructions for setting up EPUB reading functionality in the Dominicana app.

## Prerequisites

- React Native project with Expo
- Supabase project with Storage enabled
- iOS 13.0+ target
- Android API 31+ target

## Installation Steps

### 1. Install Dependencies

```bash
npm install react-native-readium
```

### 2. iOS Configuration

Update your `ios/Podfile`:

```ruby
platform :ios, '13.0'

target 'YourApp' do
  use_frameworks!
  
  # Add these pods for react-native-readium
  pod 'GCDWebServer', podspec: 'https://raw.githubusercontent.com/readium/GCDWebServer/3.7.5/GCDWebServer.podspec', modular_headers: true
  pod 'R2Navigator', podspec: 'https://raw.githubusercontent.com/readium/swift-toolkit/2.6.0/Support/CocoaPods/ReadiumNavigator.podspec'
  pod 'R2Shared', podspec: 'https://raw.githubusercontent.com/readium/swift-toolkit/2.6.0/Support/CocoaPods/ReadiumShared.podspec'
  pod 'R2Streamer', podspec: 'https://raw.githubusercontent.com/readium/swift-toolkit/2.6.0/Support/CocoaPods/ReadiumStreamer.podspec'
  pod 'ReadiumInternal', podspec: 'https://raw.githubusercontent.com/readium/swift-toolkit/2.6.0/Support/CocoaPods/ReadiumInternal.podspec'
  pod 'Minizip', modular_headers: true
end
```

Install pods:

```bash
cd ios
pod install
cd ..
```

### 3. Android Configuration

Ensure your `android/build.gradle` has:

```gradle
buildscript {
    ext {
        compileSdkVersion = 31
        // other configurations
    }
    // rest of the buildscript
}
```

### 4. Supabase Storage Setup

1. **Create Storage Bucket**:
   ```sql
   -- In Supabase SQL Editor
   INSERT INTO storage.buckets (id, name, public) 
   VALUES ('epub_files', 'epub_files', false);
   ```

2. **Set up RLS Policies**:
   ```sql
   -- Allow authenticated users to read files
   CREATE POLICY "Authenticated users can read epub files" ON storage.objects
   FOR SELECT USING (auth.role() = 'authenticated' AND bucket_id = 'epub_files');
   
   -- Allow authenticated users to upload files (for admin)
   CREATE POLICY "Authenticated users can upload epub files" ON storage.objects
   FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND bucket_id = 'epub_files');
   ```

3. **Upload EPUB Files**:
   - Use Supabase Dashboard or API
   - Upload to `epub_files` bucket
   - Update book records with file paths

### 5. Environment Variables

Ensure your `.env` file has:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Testing the Implementation

### 1. Test Book Upload

```typescript
// Test uploading an EPUB file
const uploadEpub = async (file: File, bookId: number) => {
  const fileName = `${bookId}.epub`;
  const { data, error } = await supabase.storage
    .from('epub_files')
    .upload(`public/${fileName}`, file);
    
  if (error) throw error;
  
  // Update book record
  const { error: updateError } = await supabase
    .from('books')
    .update({ epub_path: data.path })
    .eq('id', bookId);
    
  if (updateError) throw updateError;
};
```

### 2. Test Reading Functionality

1. Navigate to a book detail page
2. Ensure you're logged in
3. Click "Read Book" button
4. Verify EPUB reader opens
5. Test navigation and reading features

### 3. Test Error Scenarios

1. **No EPUB file**: Book without `epubPath`
2. **Authentication**: Log out and try to read
3. **Network error**: Disconnect internet and retry
4. **Invalid file**: Upload corrupted EPUB

## Troubleshooting

### Common Issues

1. **iOS Build Errors**:
   ```bash
   cd ios
   pod install --repo-update
   cd ..
   npx expo run:ios
   ```

2. **Android Build Errors**:
   - Ensure `compileSdkVersion = 31`
   - Clean and rebuild project

3. **EPUB Not Loading**:
   - Check file exists in Supabase Storage
   - Verify signed URL generation
   - Check network connectivity

4. **Authentication Issues**:
   - Verify user is logged in
   - Check session validity
   - Ensure RLS policies are correct

### Debug Steps

1. **Check Console Logs**:
   ```typescript
   console.log('Original URL:', urlPath);
   console.log('Extracted file path:', filePath);
   console.log('Generated signed URL:', signedUrl);
   ```

2. **Verify Supabase Setup**:
   - Check bucket exists
   - Verify RLS policies
   - Test signed URL generation

3. **Test File Access**:
   ```typescript
   // Test signed URL generation
   const { data, error } = await supabase.storage
     .from('epub_files')
     .createSignedUrl('public/test.epub', 3600);
   console.log('Signed URL:', data?.signedUrl);
   ```

## Performance Optimization

### File Size Considerations
- EPUB files should be optimized for mobile
- Consider compression for large files
- Implement progressive loading for very large books

### Memory Management
- Reader component unmounts when closed
- No persistent file caching (security requirement)
- Efficient error state management

## Security Best Practices

1. **File Access**:
   - EPUB files stored privately
   - Signed URLs with 1-hour expiry
   - Authentication required for access

2. **User Permissions**:
   - Only authenticated users can read
   - File paths validated before URL generation
   - No direct file system access

3. **Data Protection**:
   - No local file caching
   - Secure URL generation
   - Proper error handling

## Monitoring and Analytics

### Key Metrics to Track
- Reading session duration
- Book completion rates
- Error frequency
- User engagement

### Implementation
```typescript
// Track reading events
const trackReadingEvent = (event: string, bookId: number) => {
  // Implement analytics tracking
  console.log(`Reading event: ${event} for book ${bookId}`);
};
```

## Maintenance

### Regular Tasks
1. **Monitor Storage Usage**: Check bucket size and costs
2. **Update Dependencies**: Keep react-native-readium updated
3. **Test New EPUBs**: Verify compatibility with new books
4. **Security Audits**: Review access patterns and permissions

### Backup Strategy
- EPUB files backed up in Supabase Storage
- Database records include file references
- Regular exports of book metadata

## Support

For issues related to:
- **react-native-readium**: Check their GitHub repository
- **Supabase Storage**: Consult Supabase documentation
- **App-specific issues**: Review implementation documentation

## Conclusion

This setup provides a robust EPUB reading experience with proper security, cross-platform support, and error handling. Regular monitoring and maintenance ensure optimal performance and user experience.

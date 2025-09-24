# Supabase Integration Guide

This document provides comprehensive instructions for integrating Supabase into the Dominicana app.

## Prerequisites

1. **Supabase Account**: You should already have a Supabase account and database setup
2. **Project URL and Keys**: You'll need your Supabase project URL and anon key

## Setup Instructions

### 1. Environment Variables

Create a `.env` file in your project root with the following variables:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Important**: 
- Replace `your_supabase_project_url` with your actual Supabase project URL
- Replace `your_supabase_anon_key` with your actual Supabase anon key
- These can be found in your Supabase dashboard under Settings > API

### 2. Database Schema Setup

Run the SQL commands from `supabase-schema.sql` in your Supabase SQL editor:

1. Go to your Supabase dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `supabase-schema.sql`
4. Execute the script

This will create:
- `profiles` table for user data
- `books` table for ebook library
- `bookmarks` table for user bookmarks
- `reading_progress` table for tracking reading progress
- Row Level Security (RLS) policies
- Triggers for automatic profile creation

### 3. Row Level Security (RLS)

The schema includes comprehensive RLS policies that ensure:
- Users can only access their own profiles and data
- Books are publicly readable (no authentication required)
- User-specific data (bookmarks, reading progress) is properly secured

### 4. Authentication Flow

The app now supports:
- **Guest Access**: Users can access prayer functions without login
- **User Registration**: New users get automatic profile creation
- **Login/Logout**: Full authentication with session persistence
- **Profile Management**: Users can update their preferences

## Features Implemented

### Authentication
- ✅ User registration and login
- ✅ Session persistence with AsyncStorage
- ✅ Automatic profile creation on signup
- ✅ Guest access for prayer functions

### Profile Management
- ✅ User preferences sync to database
- ✅ Theme settings
- ✅ Notification preferences
- ✅ Liturgical calendar preferences

### Ebook Library
- ✅ Book catalog with categories
- ✅ Search functionality
- ✅ User-specific bookmarks
- ✅ Reading progress tracking
- ✅ Authentication-gated access

### Database Structure

#### Profiles Table
```sql
- id (UUID, Primary Key)
- email (TEXT)
- name (TEXT)
- role (TEXT: 'anonymous', 'user', 'friar', 'admin')
- preferences (JSONB)
- subscription (JSONB)
- created_at, last_login, updated_at (TIMESTAMPTZ)
```

#### Books Table
```sql
- id (UUID, Primary Key)
- title, author, year (TEXT)
- category (TEXT: theology, philosophy, etc.)
- language (TEXT)
- file_path, cover_image (TEXT)
- description (TEXT)
- is_dominican (BOOLEAN)
- epub_path, epub_sample_path (TEXT)
- tags (TEXT[])
- created_at, updated_at (TIMESTAMPTZ)
```

#### Bookmarks Table
```sql
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key to auth.users)
- book_id (UUID, Foreign Key to books)
- position (INTEGER)
- note (TEXT)
- created_at (TIMESTAMPTZ)
```

#### Reading Progress Table
```sql
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key to auth.users)
- book_id (UUID, Foreign Key to books)
- current_position (INTEGER)
- total_pages (INTEGER)
- last_read (TIMESTAMPTZ)
- time_spent (INTEGER)
- created_at, updated_at (TIMESTAMPTZ)
```

## Security Features

### Row Level Security (RLS)
- **Profiles**: Users can only access their own profile
- **Books**: Publicly readable (no authentication required)
- **Bookmarks**: Users can only access their own bookmarks
- **Reading Progress**: Users can only access their own progress

### API Key Security
- **Anon Key**: Safe for client-side use (exposed in environment variables)
- **Service Role Key**: Never exposed in client code (server-side only)

## Usage Examples

### Authentication
```typescript
import { useAuth } from '../contexts/AuthContext';

const { user, profile, signIn, signOut } = useAuth();

// Check if user is logged in
if (user) {
  console.log('User is logged in:', profile?.name);
}

// Sign in
await signIn('user@example.com', 'password');

// Sign out
await signOut();
```

### Books Management
```typescript
import { useBooks } from '../hooks/useBooks';

const { books, loading, searchBooks } = useBooks();

// Search books
await searchBooks('theology', 'theology');

// Get all books
console.log(books);
```

### Reading Progress
```typescript
import { useReadingProgress } from '../hooks/useReadingProgress';

const { 
  readingProgress, 
  updateReadingProgress, 
  addBookmark 
} = useReadingProgress();

// Update reading progress
await updateReadingProgress({
  bookId: 'book-id',
  currentPosition: 100,
  totalPages: 500,
  lastRead: new Date().toISOString(),
  timeSpent: 3600
});

// Add bookmark
await addBookmark({
  bookId: 'book-id',
  position: 100,
  note: 'Important passage'
});
```

## Troubleshooting

### Common Issues

1. **Environment Variables Not Loading**
   - Ensure `.env` file is in project root
   - Restart the development server
   - Check that variable names start with `EXPO_PUBLIC_`

2. **Authentication Not Working**
   - Verify Supabase URL and anon key are correct
   - Check that RLS policies are properly set up
   - Ensure the `handle_new_user` trigger is created

3. **Database Connection Issues**
   - Verify your Supabase project is active
   - Check that the database schema is properly set up
   - Ensure RLS policies allow the operations you're trying to perform

### Debug Mode

To enable debug logging, add this to your app:

```typescript
// In your app initialization
import { supabase } from './lib/supabase';

// Enable debug mode
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Auth event:', event, session);
});
```

## Next Steps

1. **Add your Supabase credentials** to the `.env` file
2. **Run the database schema** in your Supabase SQL editor
3. **Test the authentication flow** by creating a new account
4. **Add your ebook data** to the books table
5. **Customize the user preferences** structure as needed

## Support

If you encounter any issues:
1. Check the Supabase dashboard for error logs
2. Verify your environment variables are correct
3. Ensure the database schema is properly set up
4. Check that RLS policies are correctly configured

The integration is designed to be secure, scalable, and maintainable. All user data is properly isolated and protected by Row Level Security policies.

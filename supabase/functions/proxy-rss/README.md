# RSS Feed Proxy Edge Function

This Supabase Edge Function proxies RSS feed requests to bypass CORS restrictions on the web platform.

## Deployment

### Using Supabase CLI

1. **Install Supabase CLI** (if not already installed):
   ```bash
   npm install -g supabase
   ```

2. **Login to Supabase**:
   ```bash
   supabase login
   ```

3. **Link your project**:
   ```bash
   supabase link --project-ref your-project-ref
   ```

4. **Deploy the function**:
   ```bash
   supabase functions deploy proxy-rss
   ```

### Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **Edge Functions**
3. Click **Create a new function**
4. Name it `proxy-rss`
5. Copy the contents of `index.ts` into the editor
6. Click **Deploy**

## Usage

Once deployed, the function will be available at:
```
https://[your-project].supabase.co/functions/v1/proxy-rss?url=[encoded-rss-url]
```

The service automatically uses this function when encountering CORS issues on web.

## Testing

You can test the function directly:

```bash
curl "https://[your-project].supabase.co/functions/v1/proxy-rss?url=https%3A%2F%2Ffeeds.cohostpodcasting.com%2F8dluqp75" \
  -H "Authorization: Bearer [your-anon-key]"
```

## Features

- ✅ Bypasses CORS restrictions
- ✅ Proper CORS headers for all origins
- ✅ Caching (5 minutes)
- ✅ Error handling
- ✅ Content-Type preservation
- ✅ User-Agent for better compatibility

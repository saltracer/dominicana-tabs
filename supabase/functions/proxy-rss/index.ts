/**
 * Supabase Edge Function: RSS Feed Proxy
 * Proxies RSS feed requests to bypass CORS restrictions
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS })
  }

  try {
    // Custom auth validation
    const authHeader = req.headers.get('Authorization');
    const apikeyHeader = req.headers.get('apikey');
    
    // Check if we have the expected anon key
    const expectedAnonKey = 'sb_publishable__7pIcsK8id9M-oFPqBfZGQ_eJEqhJaV';
    
    if (!authHeader && !apikeyHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authentication headers' }),
        {
          status: 401,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        }
      )
    }
    
    // Validate the anon key
    const isValidAuth = authHeader === `Bearer ${expectedAnonKey}` || apikeyHeader === expectedAnonKey;
    
    if (!isValidAuth) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        {
          status: 401,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        }
      )
    }

    const url = new URL(req.url)
    const targetUrl = url.searchParams.get('url')
    
    if (!targetUrl) {
      return new Response(
        JSON.stringify({ error: 'Missing url parameter' }),
        {
          status: 400,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        }
      )
    }

    // Fetch the target RSS feed
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Dominicana Tabs Podcast Client/1.0',
      },
    })

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: `Failed to fetch: ${response.statusText}` }),
        {
          status: response.status,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        }
      )
    }

    // Get the content
    const contentType = response.headers.get('content-type') || 'application/xml'
    const text = await response.text()

    // Return with proper headers
    return new Response(text, {
      status: 200,
      headers: {
        ...CORS_HEADERS,
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
      },
    })
  } catch (error) {
    console.error('Proxy error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      }
    )
  }
})

import { NextRequest } from 'next/server'

const ALLOWED_HOSTS = [
  /^cdns-preview-[a-z0-9]+\.dzcdn\.net$/,
  /^cdn-preview-[a-z0-9]+\.deezer\.com$/,
  /^cdnt-preview\.dzcdn\.net$/,
  /^[a-z0-9-]+\.dzcdn\.net$/,
  /^[a-z0-9-]+\.deezer\.com$/,
]

function isAllowedUrl(url: string): boolean {
  try {
    const { protocol, hostname } = new URL(url)
    if (protocol !== 'https:') return false
    return ALLOWED_HOSTS.some(pattern => pattern.test(hostname))
  } catch {
    return false
  }
}

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url')

  if (!url || !isAllowedUrl(url)) {
    console.warn('[/api/audio] Rejected URL:', url)
    return new Response('Invalid or disallowed URL', { status: 400 })
  }

  try {
    const upstream = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'audio/webm,audio/ogg,audio/wav,audio/*;q=0.9,*/*;q=0.5',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://www.deezer.com/',
        'Origin': 'https://www.deezer.com',
      },
    })

    console.log('[/api/audio] Upstream response:', upstream.status, url)

    if (!upstream.ok) {
      return new Response(`Upstream failed: ${upstream.status}`, { status: 502 })
    }

    return new Response(upstream.body, {
      headers: {
        'Content-Type': upstream.headers.get('Content-Type') ?? 'audio/mpeg',
        'Content-Length': upstream.headers.get('Content-Length') ?? '',
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (err) {
    console.error('[/api/audio] Fetch error:', err, url)
    return new Response('Upstream fetch failed', { status: 502 })
  }
}
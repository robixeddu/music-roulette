import { NextRequest } from 'next/server'

// Domini CDN Deezer legittimi per i preview audio
const ALLOWED_HOSTS = [
  /^cdns-preview-[a-z0-9]+\.dzcdn\.net$/,
  /^cdn-preview-[a-z0-9]+\.deezer\.com$/,
  /^cdnt-preview\.dzcdn\.net$/,
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

/**
 * GET /api/audio?url=https://cdns-preview-x.dzcdn.net/...
 *
 * Proxy server-side per i preview audio Deezer.
 * Necessario perché i CDN Deezer non includono header CORS
 * compatibili con richieste da domini HTTPS di terze parti (ORB blocking).
 */
export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url')

  if (!url || !isAllowedUrl(url)) {
    // Log per debug: mostra quale URL sta fallendo
    console.warn('[/api/audio] Rejected URL:', url)
    return new Response('Invalid or disallowed URL', { status: 400 })
  }

  try {
    const upstream = await fetch(url, {
      headers: {
        Referer: 'https://www.deezer.com/',
        'User-Agent': 'Mozilla/5.0',
      },
    })

    if (!upstream.ok) {
      return new Response('Audio not available', { status: 502 })
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
  } catch {
    return new Response('Upstream fetch failed', { status: 502 })
  }
}
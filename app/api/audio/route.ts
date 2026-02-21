import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url')

  if (!url || !url.startsWith('https://cdns-preview')) {
    return new Response('Invalid URL', { status: 400 })
  }

  const upstream = await fetch(url)

  if (!upstream.ok) {
    return new Response('Audio not available', { status: 502 })
  }

  // Proxy dello stream con gli header CORS corretti
  return new Response(upstream.body, {
    headers: {
      'Content-Type': upstream.headers.get('Content-Type') ?? 'audio/mpeg',
      'Content-Length': upstream.headers.get('Content-Length') ?? '',
      'Cache-Control': 'public, max-age=3600',
      'Access-Control-Allow-Origin': '*',
    },
  })
}
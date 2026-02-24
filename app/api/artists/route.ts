import { NextRequest, NextResponse } from "next/server";
import { searchArtists } from "@/lib/itunes";

/**
 * GET /api/artists?q=metallica
 * Autocomplete artisti — proxy verso iTunes Search API.
 * Cache breve (5min) per non martellare iTunes su ogni tasto.
 */
export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q") ?? "";

  if (!q.trim() || q.length < 2) {
    return NextResponse.json([]);
  }

  try {
    const artists = await searchArtists(q, 6);
    return NextResponse.json(artists, {
      headers: { "Cache-Control": "public, s-maxage=300" },
    });
  } catch {
    return NextResponse.json([]);
  }
}

import { NextRequest, NextResponse } from "next/server";
import {
  fetchTracksByArtist,
  pickQuestionTracks,
  buildArtistQuestion,
} from "@/lib/itunes";

/**
 * GET /api/artist-track?artist=Radiohead
 * Costruisce una domanda "indovina il titolo" per l'artista richiesto.
 * Le 4 opzioni sono tutte canzoni dello stesso artista — più difficile.
 */
export async function GET(request: NextRequest) {
  const artist = request.nextUrl.searchParams.get("artist") ?? "";

  if (!artist.trim()) {
    return NextResponse.json({ error: "Artista mancante." }, { status: 400 });
  }

  try {
    const tracks = await fetchTracksByArtist(artist);

    if (tracks.length < 4) {
      return NextResponse.json(
        {
          error: `Brani insufficienti per "${artist}" su iTunes (trovati: ${tracks.length}).`,
        },
        { status: 404 }
      );
    }

    const { correct, fakes } = pickQuestionTracks(tracks, 3);
    const question = buildArtistQuestion(correct, fakes);

    return NextResponse.json(question, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("[/api/artist-track]", error);
    return NextResponse.json(
      { error: "Impossibile caricare la traccia. Riprova." },
      { status: 500 }
    );
  }
}

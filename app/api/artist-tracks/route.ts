import { NextRequest, NextResponse } from "next/server";
import {
  fetchTracksByArtistId,
  pickQuestionTracks,
  buildQuestion,
} from "@/lib/itunes";

/**
 * GET /api/artist-tracks?artistId=12345
 * Costruisce una domanda casuale dai brani dell'artista specificato.
 */
export async function GET(request: NextRequest) {
  const artistIdParam = request.nextUrl.searchParams.get("artistId");
  const artistId = Number(artistIdParam);

  if (!artistId || isNaN(artistId)) {
    return NextResponse.json(
      { error: "artistId mancante o non valido." },
      { status: 400 }
    );
  }

  try {
    const tracks = await fetchTracksByArtistId(artistId);

    if (tracks.length < 4) {
      return NextResponse.json(
        { error: "Brani insufficienti per questo artista. Provane un altro." },
        { status: 422 }
      );
    }

    const { correct, fakes } = pickQuestionTracks(tracks, 3);
    const question = buildQuestion(correct, fakes);

    return NextResponse.json(question, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("[/api/artist-tracks]", error);
    return NextResponse.json(
      { error: "Impossibile caricare i brani. Riprova." },
      { status: 500 }
    );
  }
}

// lib/audio.ts
export function proxyAudioUrl(url: string): string {
  return `/api/audio?url=${encodeURIComponent(url)}`
}
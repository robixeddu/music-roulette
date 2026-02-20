import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Cover album
      { protocol: 'https', hostname: 'e-cdns-images.dzcdn.net' },
      { protocol: 'https', hostname: 'cdns-images.dzcdn.net' },
      { protocol: 'https', hostname: 'cdn-images.dzcdn.net' },
      // Immagini generi
      { protocol: 'https', hostname: 'misc.scdn.co' },
      { protocol: 'https', hostname: 'e-cdns-images.dzcdn.net' },
    ],
  },
}

export default nextConfig

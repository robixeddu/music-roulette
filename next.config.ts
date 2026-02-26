import type { NextConfig } from 'next'

const securityHeaders = [
  // Impedisce MIME-type sniffing
  { key: 'X-Content-Type-Options',  value: 'nosniff' },
  // Impedisce embedding in iframe (clickjacking)
  { key: 'X-Frame-Options',         value: 'DENY' },
  // Limita info nel Referer header verso siti esterni
  { key: 'Referrer-Policy',         value: 'strict-origin-when-cross-origin' },
  // Disabilita feature browser non necessarie
  { key: 'Permissions-Policy',      value: 'camera=(), microphone=(), geolocation=(), payment=()' },
  // DNS prefetch per performance
  { key: 'X-DNS-Prefetch-Control',  value: 'on' },
]

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Cover album iTunes — solo domini Apple ufficiali
      { protocol: 'https', hostname: 'is1-ssl.mzstatic.com' },
      { protocol: 'https', hostname: 'is2-ssl.mzstatic.com' },
      { protocol: 'https', hostname: 'is3-ssl.mzstatic.com' },
      { protocol: 'https', hostname: 'is4-ssl.mzstatic.com' },
      { protocol: 'https', hostname: 'is5-ssl.mzstatic.com' },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },
}

export default nextConfig

/**
 * Neon database client — server only.
 * Usa @neondatabase/serverless ottimizzato per edge/serverless.
 */
import { neon } from '@neondatabase/serverless'

if (!process.env.POSTGRES_URL) {
  throw new Error('POSTGRES_URL env var is not set')
}

export const sql = neon(process.env.POSTGRES_URL)

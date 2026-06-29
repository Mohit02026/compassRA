import Redis from 'ioredis'

let _client: Redis | null = null

// Returns null when REDIS_URL is unset — callers must handle gracefully.
// All cache reads/writes are optional; a miss or error just falls through to the source.
export function getRedis(): Redis | null {
  if (!process.env.REDIS_URL) return null
  if (!_client) {
    _client = new Redis(process.env.REDIS_URL, {
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      connectTimeout: 3000,
    })
    _client.on('error', (err: Error) => console.error('[redis]', err.message))
  }
  return _client
}

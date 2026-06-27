import { getRedis } from '@/lib/redis'

export interface RateLimitResult {
  success: boolean
  remaining: number
}

// Sliding window rate limiter using Redis sorted sets.
// Degrades gracefully: if Redis is unavailable, requests pass through.
export async function checkRateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  const redis = getRedis()
  if (!redis) return { success: true, remaining: limit }

  const now = Date.now()
  const windowStart = now - windowSeconds * 1000
  const redisKey = `rl:${key}`

  try {
    const pipe = redis.pipeline()
    pipe.zremrangebyscore(redisKey, '-inf', windowStart)
    pipe.zadd(redisKey, now, `${now}:${Math.random().toString(36).slice(2)}`)
    pipe.zcard(redisKey)
    pipe.expire(redisKey, windowSeconds + 1)

    const results = await pipe.exec()
    const count = (results?.[2]?.[1] as number) ?? 0

    return { success: count <= limit, remaining: Math.max(0, limit - count) }
  } catch {
    return { success: true, remaining: limit }
  }
}

// Extract client IP from Next.js request headers (works behind Railway/Vercel proxy)
export function getClientIp(headers: { get: (name: string) => string | null }): string {
  const forwarded = headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return 'unknown'
}

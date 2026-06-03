#!/usr/bin/env node
/**
 * Pre-warm the Next.js font cache for E2E tests.
 *
 * next/font/google webpack loaders run in worker threads that don't see MSW.
 * They download font files from Google and cache them in .next/cache/fetch-cache/.
 * This script starts Next.js WITHOUT MSW, requests a few pages to trigger
 * font compilation, then stops. Subsequent runs reuse the font cache.
 *
 * Run once on a fresh checkout: pnpm e2e:warm
 */

import * as http from 'http'
import * as cp from 'child_process'
import * as path from 'path'

const ROOT = path.resolve(__dirname, '../../../')

function waitForServer(url: string, timeoutMs = 90_000): Promise<void> {
  return new Promise((resolve, reject) => {
    const start = Date.now()
    const check = () => {
      http
        .get(url, (res) => {
          if (res.statusCode && res.statusCode < 500) {
            resolve()
          } else {
            if (Date.now() - start > timeoutMs) reject(new Error(`Server not ready after ${timeoutMs}ms`))
            else setTimeout(check, 2000)
          }
        })
        .on('error', () => {
          if (Date.now() - start > timeoutMs) reject(new Error(`Server not ready after ${timeoutMs}ms`))
          else setTimeout(check, 2000)
        })
    }
    check()
  })
}

async function main() {
  console.log('[warm-fonts] Starting Next.js without MSW to pre-warm font cache...')

  const server = cp.spawn(
    process.execPath,
    ['node_modules/next/dist/bin/next', 'dev', '-p', '3002'],
    {
      cwd: ROOT,
      env: {
        ...process.env,
        ENABLE_MSW: 'false',
        DATABASE_URL: 'postgresql://compass:compass@localhost:5433/compass_test',
        NEXTAUTH_URL: 'http://localhost:3002',
        NEXTAUTH_SECRET: 'warmup-secret',
        ENCRYPTION_KEY: '0'.repeat(64),
        CRON_SECRET: 'warmup',
      },
      stdio: 'pipe',
    }
  )

  server.stdout?.on('data', (d) => process.stdout.write(d))
  server.stderr?.on('data', (d) => process.stderr.write(d))

  try {
    console.log('[warm-fonts] Waiting for server on port 3002...')
    await waitForServer('http://localhost:3002', 120_000)
    console.log('[warm-fonts] Server ready. Requesting pages to trigger font compilation...')

    // Request a few pages to trigger font compilation + cache
    const pages = ['/', '/login', '/ops/login']
    for (const page of pages) {
      await new Promise<void>((resolve) => {
        http.get(`http://localhost:3002${page}`, (res) => {
          res.resume()
          res.on('end', () => {
            console.log(`[warm-fonts] Compiled ${page}`)
            resolve()
          })
        }).on('error', () => resolve())
      })
    }

    console.log('[warm-fonts] Font cache warm. Stopping server.')
  } finally {
    server.kill('SIGTERM')
    await new Promise<void>((resolve) => server.on('exit', () => resolve()))
    console.log('[warm-fonts] Done.')
  }
}

main().catch((err) => {
  console.error('[warm-fonts] Error:', err.message)
  process.exit(1)
})

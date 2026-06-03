import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// pnpm creates two Next.js variants:
// 1. next@14.2.35_@playwright+te_... (what node_modules/next symlinks to)
// 2. next@14.2.35_react-dom@18.3.1_... (what next-auth's node_modules/next symlinks to)
//
// Both hard-link to the same pnpm store files but webpack assigns different
// module IDs to each path, creating duplicate React context instances:
//   "Invariant: Missing ActionQueueContext"
//
// Fix: alias 'next' to the explicit playwright-variant path so ALL packages
// (including next-auth) use the same module ID. Both variants contain identical
// files (hard links), so behaviour is unchanged.

// Use the playwright variant as canonical (it's what node_modules/next points to).
// Must be an absolute non-symlink path so webpack skips fs.realpath() which can
// return D:\compass (lowercase) vs D:\Compass (uppercase) on Windows.
const canonicalNext = path.join(
  __dirname,
  'node_modules/.pnpm/next@14.2.35_@playwright+te_a466e221dfe76eb6a42f4d2db719b2ed/node_modules/next'
)

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Required for instrumentation.ts — enables MSW server-side intercepts in E2E
  experimental: {
    instrumentationHook: true,
  },
  webpack: (config) => {
    // Redirect ALL imports of 'next/*' to the playwright-variant absolute path.
    // Without $ suffix this matches 'next' AND 'next/dist/...' (prefix match).
    // next-auth previously resolved 'next' to the react-dom variant — now both
    // use the playwright variant path, yielding one module ID per file.
    config.resolve.alias = {
      ...config.resolve.alias,
      next: canonicalNext,
    }
    return config
  },
}

export default nextConfig

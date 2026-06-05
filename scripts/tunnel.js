#!/usr/bin/env node
// Local tunnel for webhook testing — exposes localhost:3000 via localtunnel.
// Usage: node scripts/tunnel.js  (or: pnpm tunnel)
//
// Output: tunnel URL ready to paste into GHL workflow webhook action.
// Stripe: run `stripe listen --forward-to <url>/api/webhooks/stripe` separately.

const { execSync } = require('child_process')
const { spawn } = require('child_process')

const PORT = process.env.PORT ?? '3000'

console.log(`\nStarting tunnel → localhost:${PORT} ...\n`)

const lt = spawn('npx', ['--yes', 'localtunnel', '--port', PORT], {
  stdio: ['ignore', 'pipe', 'pipe'],
  shell: true,
})

lt.stdout.on('data', (data) => {
  const line = data.toString().trim()
  // localtunnel prints: "your url is: https://xxxx.loca.lt"
  const match = line.match(/https?:\/\/[^\s]+/)
  if (match) {
    const url = match[0]
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('🚇  Tunnel active')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`  Base URL:        ${url}`)
    console.log(`  GHL webhook:     ${url}/api/webhooks/ghl`)
    console.log(`  Stripe webhook:  ${url}/api/webhooks/stripe`)
    console.log('')
    console.log('  Stripe CLI:')
    console.log(`    stripe listen --forward-to ${url}/api/webhooks/stripe`)
    console.log('')
    console.log('  Paste the GHL webhook URL into your GHL workflow')
    console.log('  "Send Data to Webhook" action and save.')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('  Ctrl+C to stop\n')
  } else {
    console.log(line)
  }
})

lt.stderr.on('data', (data) => {
  const msg = data.toString().trim()
  if (msg) console.error('tunnel error:', msg)
})

lt.on('close', (code) => {
  console.log(`\nTunnel closed (exit ${code})`)
  process.exit(code ?? 0)
})

process.on('SIGINT', () => {
  lt.kill()
  process.exit(0)
})

import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: 'node',
    setupFiles: ['./tests/setup.ts'],
    testTimeout: 30000,
    // Run all test files in a single worker — prevents DB deadlocks on TRUNCATE
    fileParallelism: false,
    // Exclude stale agent worktrees from previous parallel-agent sessions
    exclude: ['.claude/worktrees/**', 'node_modules/**', 'tests/e2e/**'],
    env: {
      ENCRYPTION_KEY: '0'.repeat(64),
      NEXTAUTH_SECRET: 'test-secret',
      NEXTAUTH_URL: 'http://localhost:3000',
      NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
      CRON_SECRET: 'test-cron-secret',
    },
  },
})

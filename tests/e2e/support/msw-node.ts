// MSW Node.js server instance — shared between instrumentation.ts and tests.
// setupServer() patches Node's fetch; unhandled requests bypass to the network.

import { setupServer } from 'msw/node'
import { handlers } from './msw-handlers'

export const server = setupServer(...handlers)

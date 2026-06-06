import type { NextAuthConfig } from 'next-auth'

// Edge-compatible auth config — no bcrypt, no Prisma.
// Used by middleware.ts (Edge Runtime).
// lib/auth.ts imports this and adds the full Credentials provider with DB lookups.
export const authConfig: NextAuthConfig = {
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
  },
  providers: [],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as { role: string }).role
        token.tenantId = (user as { tenantId: string }).tenantId
        token.mustChangePwd = (user as { mustChangePwd: boolean }).mustChangePwd
      }
      return token
    },
    async session({ session, token }) {
      session.user.id = token.id as string
      session.user.role = token.role as string
      session.user.tenantId = token.tenantId as string
      session.user.mustChangePwd = token.mustChangePwd as boolean
      return session
    },
  },
}

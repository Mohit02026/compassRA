import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { compare } from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { authConfig } from '@/lib/auth.config'
import { checkRateLimit, getClientIp } from '@/lib/ratelimit'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, request) {
        const ip = getClientIp(request.headers)
        const limited = await checkRateLimit(`login:${ip}`, 5, 15 * 60)
        if (!limited.success) return null

        const parsed = loginSchema.safeParse(credentials)
        if (!parsed.success) return null

        const { email, password } = parsed.data

        const user = await prisma.user.findFirst({
          where: { email, deletedAt: null },
        })
        if (!user) return null

        const valid = await compare(password, user.passwordHash)
        if (!valid) return null

        return {
          id: user.id,
          email: user.email,
          role: user.role,
          tenantId: user.tenantId,
          mustChangePwd: user.mustChangePwd,
        }
      },
    }),
  ],
})

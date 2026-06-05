'use server'

import { signOut } from '@/lib/auth'

export async function signOutAction() {
  await signOut({ redirectTo: '/login' })
}

export async function signOutOpsAction() {
  await signOut({ redirectTo: '/ops/login' })
}

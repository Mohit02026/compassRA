import { auth } from '@/lib/auth'
import { PortalAccountForm } from './form'

export default async function PortalAccountPage() {
  const session = await auth()

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'var(--font-jakarta)', fontWeight: 700, fontSize: 24, color: 'oklch(0.20 0.08 245)', marginBottom: 4 }}>
          Account
        </h1>
        <p style={{ fontSize: 14, color: 'oklch(0.42 0.07 245)' }}>
          Manage your account settings.
        </p>
      </div>

      <PortalAccountForm email={session?.user?.email ?? '—'} />
    </div>
  )
}

// Server component — reads auth session and passes email to the client form.
// Avoids useSession() which requires SessionProvider in the client tree.
import { auth } from '@/lib/auth'
import { PortalAccountForm } from './form'

export default async function PortalAccountPage() {
  const session = await auth()

  return (
    <div>
      <div className="mb-6">
        <h1
          className="text-2xl font-bold"
          style={{ fontFamily: 'var(--font-jakarta)', color: 'var(--color-navy-mid)' }}
        >
          Account
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--color-muted)' }}>
          Manage your account settings.
        </p>
      </div>

      <PortalAccountForm email={session?.user?.email ?? '—'} />
    </div>
  )
}

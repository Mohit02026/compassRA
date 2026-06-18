interface PanelContactCardProps {
  firstName: string
  lastName: string
  email: string
  phone: string
}

function CheckMark({ show }: { show: boolean }) {
  return (
    <span
      style={{
        width: 18,
        height: 18,
        borderRadius: '50%',
        background: show ? '#22c55e' : 'rgb(230,232,236)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        transition: 'background 0.2s',
      }}
    >
      {show && (
        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
          <path d="M1 4l3 3 5-6" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </span>
  )
}

export default function PanelContactCard({ firstName, lastName, email, phone }: PanelContactCardProps) {
  const rows = [
    { label: 'First name', value: firstName, show: firstName.trim().length > 0 },
    { label: 'Last name', value: lastName, show: lastName.trim().length > 0 },
    { label: 'Email', value: email, show: email.includes('@') },
    { label: 'Phone', value: phone, show: phone.replace(/\D/g, '').length >= 10 },
  ]

  return (
    <div
      style={{
        background: '#ffffff',
        borderRadius: 16,
        border: '1px solid rgb(230, 232, 236)',
        padding: 32,
        minHeight: 340,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Avatar */}
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          background: 'rgb(240, 244, 255)',
          border: '2px solid rgb(200, 210, 240)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 20,
          fontSize: 28,
        }}
      >
        👤
      </div>

      {/* Contact card */}
      <div
        style={{
          width: '100%',
          maxWidth: 320,
          background: 'rgb(247, 248, 252)',
          borderRadius: 12,
          border: '1px solid rgb(220, 224, 236)',
          overflow: 'hidden',
        }}
      >
        {rows.map((row, i) => (
          <div
            key={row.label}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              borderBottom: i < rows.length - 1 ? '1px solid rgb(220,224,236)' : 'none',
              gap: 12,
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 10, color: 'rgb(140,140,140)', fontFamily: 'var(--font-dm-sans)', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {row.label}
              </p>
              <p
                style={{
                  fontSize: 14,
                  color: row.value.trim() ? 'rgb(30,30,30)' : 'rgb(190,192,196)',
                  fontFamily: 'var(--font-dm-sans)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {row.value.trim() || '—'}
              </p>
            </div>
            <CheckMark show={row.show} />
          </div>
        ))}
      </div>
    </div>
  )
}

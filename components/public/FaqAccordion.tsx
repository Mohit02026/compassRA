interface FaqItem {
  question: string
  answer: string
}

export default function FaqAccordion({ items }: { items: FaqItem[] }) {
  return (
    <div style={{ fontFamily: 'var(--font-dm-sans)', display: 'flex', flexDirection: 'column', gap: 8 }}>
      {items.map((item, i) => (
        <details
          key={i}
          open={i === 0}
          style={{
            background: '#ffffff',
            borderRadius: 12,
            padding: '20px 24px',
            border: '1px solid rgb(230,230,230)',
          }}
        >
          <summary
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: 'rgb(23, 23, 23)',
              cursor: 'pointer',
              listStyle: 'none',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 16,
            }}
          >
            {item.question}
            <span
              style={{
                color: '#3b60f3',
                fontSize: 22,
                flexShrink: 0,
                lineHeight: 1,
                fontWeight: 300,
              }}
            >
              +
            </span>
          </summary>
          <div
            style={{
              paddingTop: 16,
              fontSize: 14,
              lineHeight: 1.75,
              color: 'rgb(76, 76, 76)',
            }}
          >
            {item.answer}
          </div>
        </details>
      ))}
    </div>
  )
}

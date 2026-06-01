interface Props {
  params: { id: string }
}

export default function OpsOrderDetailPage({ params }: Props) {
  return (
    <div>
      <h1 className="text-2xl font-bold" style={{ color: 'var(--color-navy-mid)' }}>
        Order {params.id}
      </h1>
      <p className="text-sm mt-1" style={{ color: 'var(--color-muted)' }}>
        Order detail — coming in Phase 3.
      </p>
    </div>
  )
}

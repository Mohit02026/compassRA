import { OrderStatus } from '@prisma/client'

const STATUS_STYLES: Record<OrderStatus, string> = {
  INTAKE:
    'bg-[--color-intake-bg] text-[--color-intake-text] border border-[--color-intake-border]',
  REVIEW:
    'bg-[--color-review-bg] text-[--color-review-text] border border-[--color-review-border]',
  FILED:
    'bg-[--color-filed-bg] text-[--color-filed-text] border border-[--color-filed-border]',
  COMPLETED:
    'bg-[--color-completed-bg] text-[--color-completed-text] border border-[--color-completed-border]',
  EXCEPTION:
    'bg-[--color-exception-bg] text-[--color-exception-text] border border-[--color-exception-border]',
}

const STATUS_LABELS: Record<OrderStatus, string> = {
  INTAKE: 'Intake',
  REVIEW: 'Review',
  FILED: 'Filed',
  COMPLETED: 'Completed',
  EXCEPTION: 'Exception',
}

interface Props {
  status: OrderStatus
  className?: string
}

export function StatusPill({ status, className = '' }: Props) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[status]} ${className}`}
    >
      {STATUS_LABELS[status]}
    </span>
  )
}

import { OrderStatus, PaymentStatus } from '@prisma/client'

const STATUS_STYLES: Record<OrderStatus, string> = {
  INTAKE:
    'bg-[--color-intake-bg] text-[--color-intake-text] border border-[--color-intake-border]',
  DATA_QC:
    'bg-[--color-review-bg] text-[--color-review-text] border border-[--color-review-border]',
  READY_TO_FILE:
    'bg-amber-50 text-amber-700 border border-amber-200',
  FILED:
    'bg-[--color-filed-bg] text-[--color-filed-text] border border-[--color-filed-border]',
  COMPLETED:
    'bg-[--color-completed-bg] text-[--color-completed-text] border border-[--color-completed-border]',
  EXCEPTION:
    'bg-[--color-exception-bg] text-[--color-exception-text] border border-[--color-exception-border]',
}

const STATUS_LABELS: Record<OrderStatus, string> = {
  INTAKE:        'Intake',
  DATA_QC:       'Data QC',
  READY_TO_FILE: 'Ready to File',
  FILED:         'Filed',
  COMPLETED:     'Completed',
  EXCEPTION:     'Exception',
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

const PAYMENT_STATUS_STYLES: Record<PaymentStatus, string> = {
  CONFIRMED: 'bg-green-600 text-white',
  PENDING:   'bg-transparent text-amber-700 border border-amber-300',
}

const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  CONFIRMED: 'Paid',
  PENDING:   'Unpaid',
}

interface PaymentStatusPillProps {
  status: PaymentStatus
  className?: string
}

export function PaymentStatusPill({ status, className = '' }: PaymentStatusPillProps) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${PAYMENT_STATUS_STYLES[status]} ${className}`}
    >
      {PAYMENT_STATUS_LABELS[status]}
    </span>
  )
}

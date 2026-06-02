import { OrderStatus } from '@prisma/client'

const STAGE_ORDER: OrderStatus[] = ['INTAKE', 'DATA_QC', 'READY_TO_FILE', 'FILED', 'COMPLETED']

function stageState(
  stage: OrderStatus,
  current: OrderStatus
): 'completed' | 'active' | 'future' | 'exception' {
  if (current === 'EXCEPTION') {
    // Show exception at DATA_QC position — that's where it can be reopened from
    const stageIdx = STAGE_ORDER.indexOf(stage)
    const currentIdx = STAGE_ORDER.indexOf('DATA_QC')
    if (stageIdx < currentIdx) return 'completed'
    if (stageIdx === currentIdx) return 'exception'
    return 'future'
  }
  const stageIdx = STAGE_ORDER.indexOf(stage)
  const currentIdx = STAGE_ORDER.indexOf(current)
  if (stageIdx < currentIdx) return 'completed'
  if (stageIdx === currentIdx) return 'active'
  return 'future'
}

const STAGE_LABELS: Record<OrderStatus, string> = {
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

export function StageTracker({ status, className = '' }: Props) {
  return (
    <div
      className={`w-full border rounded-lg p-4 bg-white flex items-center gap-2 flex-wrap ${className}`}
      style={{ borderColor: 'var(--color-border)' }}
    >
      {STAGE_ORDER.map((stage, i) => {
        const state = stageState(stage, status)
        return (
          <div key={stage} className="flex items-center gap-2">
            <span
              className={`px-4 py-1.5 rounded-full text-sm font-medium border-2 ${
                state === 'completed'
                  ? 'border-green-500 text-green-700 bg-green-50'
                  : state === 'active'
                  ? 'text-white border-transparent'
                  : state === 'exception'
                  ? 'border-orange-400 text-orange-700 bg-orange-50'
                  : 'border-gray-200 text-gray-400 bg-white'
              }`}
              style={state === 'active' ? { backgroundColor: 'var(--color-navy)' } : {}}
            >
              {STAGE_LABELS[stage]}
            </span>
            {i < STAGE_ORDER.length - 1 && (
              <span className="text-gray-300 text-sm select-none">——</span>
            )}
          </div>
        )
      })}
      {status === 'EXCEPTION' && (
        <div className="flex items-center gap-2">
          <span className="text-gray-300 text-sm select-none">——</span>
          <span className="px-4 py-1.5 rounded-full text-sm font-medium border-2 border-orange-400 text-orange-700 bg-orange-50">
            Exception
          </span>
        </div>
      )}
    </div>
  )
}

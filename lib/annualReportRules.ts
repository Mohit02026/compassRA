// Per-state Annual Report due date rules. Only FL is implemented — Compass is
// Florida-only today. Adding a state later means adding an entry here, not
// touching the callers.
const ANNUAL_REPORT_DUE_DATE: Record<string, { month: number; day: number }> = {
  FL: { month: 5, day: 1 }, // Florida: due May 1 every year, fixed date (not formation-anniversary based)
}

// Returns the next occurrence of the state's due date (today or in the future).
// Returns null if the state isn't supported yet — callers must handle this
// (e.g. leave dueDate unset and let ops set it manually) rather than guessing.
export function getNextAnnualReportDueDate(state: string, from: Date = new Date()): Date | null {
  const rule = ANNUAL_REPORT_DUE_DATE[state]
  if (!rule) return null

  const today = new Date(from)
  today.setHours(0, 0, 0, 0)

  let dueDate = new Date(today.getFullYear(), rule.month - 1, rule.day)
  if (dueDate < today) {
    dueDate = new Date(today.getFullYear() + 1, rule.month - 1, rule.day)
  }
  return dueDate
}

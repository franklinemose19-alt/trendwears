import type { PaymentStatus } from '@/types'

// Same rule the database enforces, so merchants get an instant hint. The database is still the authority.
export const MPESA_CODE_PATTERN = /^[A-Z0-9]{8,12}$/

export function cleanMpesaCode(raw: string): string {
  return raw.trim().toUpperCase().replace(/\s+/g, '')
}

export function validateMpesaCode(raw: string): string | null {
  const code = cleanMpesaCode(raw)
  if (!code) return 'Enter the M-Pesa confirmation code from your payment message.'
  if (!MPESA_CODE_PATTERN.test(code)) {
    return 'An M-Pesa code has 8 to 12 letters and numbers, for example QGH7X8Y9Z1.'
  }
  return null
}

export const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  pending: 'Waiting for MIRA to check',
  verified: 'Confirmed',
  rejected: 'Not confirmed',
  cancelled: 'Cancelled',
}

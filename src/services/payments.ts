import { supabase } from '@/lib/supabase'
import type { PaymentRecord, PaymentWithBusiness } from '@/types'

type PaidPlan = 'basic' | 'popular'

// A merchant's own payments (the database only returns rows for stores they own).
export async function fetchMyPayments(businessId: string): Promise<PaymentRecord[]> {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('business_id', businessId)
    .order('submitted_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data ?? []) as PaymentRecord[]
}

// Asks MIRA to check a payment. This does NOT activate anything: only an administrator can verify it.
export async function submitPaymentClaim(plan: PaidPlan, reference: string): Promise<PaymentRecord> {
  const { data, error } = await supabase.rpc('submit_payment_claim', { p_plan: plan, p_reference: reference })
  if (error) throw new Error(error.message)
  return data as PaymentRecord
}

// ---- MIRA administrators only (the database refuses anyone else) ----

export async function fetchPaymentsForReview(): Promise<PaymentWithBusiness[]> {
  const { data, error } = await supabase
    .from('payments')
    .select('*, businesses(name, slug)')
    .order('submitted_at', { ascending: false })
    .limit(60)
  if (error) throw new Error(error.message)
  return (data ?? []) as PaymentWithBusiness[]
}

export async function verifyPayment(paymentId: string, amountReceived: number): Promise<PaymentRecord> {
  const { data, error } = await supabase.rpc('admin_verify_payment', {
    p_payment_id: paymentId,
    p_amount_received: amountReceived,
  })
  if (error) throw new Error(error.message)
  return data as PaymentRecord
}

export async function rejectPayment(paymentId: string, note: string): Promise<PaymentRecord> {
  const { data, error } = await supabase.rpc('admin_reject_payment', {
    p_payment_id: paymentId,
    p_note: note || null,
  })
  if (error) throw new Error(error.message)
  return data as PaymentRecord
}

export async function recordPayment(
  businessId: string,
  plan: PaidPlan,
  amountReceived: number,
  reference: string
): Promise<PaymentRecord> {
  const { data, error } = await supabase.rpc('admin_record_payment', {
    p_business_id: businessId,
    p_plan: plan,
    p_amount_received: amountReceived,
    p_reference: reference,
  })
  if (error) throw new Error(error.message)
  return data as PaymentRecord
}

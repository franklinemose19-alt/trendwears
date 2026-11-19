import { PREVIEW_TRIAL_DAYS } from '@/config'

const KEY = 'mira_ref'

// A referral code is 8 letters/numbers. Anything else in a link is ignored.
export const REFERRAL_CODE_PATTERN = /^[A-Z0-9]{6,12}$/

export function normalizeReferralCode(raw: string | null | undefined): string | null {
  const code = (raw ?? '').trim().toUpperCase()
  return REFERRAL_CODE_PATTERN.test(code) ? code : null
}

// When someone opens a link like https://your-site/?ref=ABCD1234 the code is remembered, so it survives
// the signup steps (including confirming an email and coming back later).
export function captureReferralFromUrl(search: string = window.location.search): void {
  try {
    const code = normalizeReferralCode(new URLSearchParams(search).get('ref'))
    if (code) localStorage.setItem(KEY, code)
  } catch { /* storage can be blocked in private mode: the referral simply is not remembered */ }
}

export function getPendingReferral(): string | null {
  try {
    return normalizeReferralCode(localStorage.getItem(KEY))
  } catch {
    return null
  }
}

export function clearPendingReferral(): void {
  try { localStorage.removeItem(KEY) } catch { /* nothing to clear */ }
}

export function referralLink(code: string, origin: string = window.location.origin): string {
  return origin + '/?ref=' + code
}

export function referralShareMessage(storeName: string, link: string): string {
  return (
    'Hi! I sell on MIRA (' + storeName + '). MIRA gives boutiques their own branded online store with WhatsApp ordering. ' +
    'You can try it free for ' + PREVIEW_TRIAL_DAYS + ' days, no payment details needed: ' + link
  )
}

export type ReferralStep = { set_up: boolean; published: boolean; paying: boolean }

// How far a referred store has got. It counts as a paying referral only when ALL four steps are done.
export function referralStageLabel(r: ReferralStep): string {
  if (r.set_up && r.published && r.paying) return 'Paying subscriber'
  if (r.paying) return 'Subscribed - setup not finished'
  if (r.set_up && r.published) return 'Published'
  if (r.set_up) return 'Store set up'
  return 'Signed up'
}

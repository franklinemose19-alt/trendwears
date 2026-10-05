import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { fetchMyBusiness, registerBusiness } from '@/services/businesses'
import type { Business } from '@/types'

export default function Register() {
  const navigate = useNavigate()
  const [checkingSession, setCheckingSession] = useState(true)
  const [loggedInEmail, setLoggedInEmail] = useState<string | null>(null)
  const [existingBusiness, setExistingBusiness] = useState<Business | null>(null)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [whatsappNumber, setWhatsappNumber] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)

  async function checkSession() {
    setCheckingSession(true)
    const { data: auth } = await supabase.auth.getUser()
    if (auth.user) {
      setLoggedInEmail(auth.user.email ?? null)
      const business = await fetchMyBusiness()
      setExistingBusiness(business)
    } else {
      setLoggedInEmail(null)
      setExistingBusiness(null)
    }
    setCheckingSession(false)
  }

  useEffect(() => { checkSession() }, [])

  async function handleLogoutAndRegisterNew() {
    await supabase.auth.signOut()
    await checkSession()
  }

  async function handleCompleteRegistration(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await registerBusiness({ name: businessName, whatsappNumber })
      navigate('/admin')
    } catch (err: any) {
      setError(err?.message ?? 'Something went wrong. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  async function handleSignUpAndRegister(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError('')
    setNotice('')
    try {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({ email, password })
      if (signUpError) throw signUpError

      if (!signUpData.session) {
        setNotice('Check your email to confirm your account, then come back here and sign in to finish setting up your store.')
        setBusy(false)
        return
      }

      await registerBusiness({ name: businessName, whatsappNumber })
      navigate('/admin')
    } catch (err: any) {
      setError(err?.message ?? 'Something went wrong. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  if (checkingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0b] text-white/50">
        Loading...
      </div>
    )
  }

  // Already signed in AND already owns a business - don't silently redirect, explain clearly.
  if (loggedInEmail && existingBusiness) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0b] px-5 text-center text-[#e8e8e6]">
        <div className="w-full max-w-sm rounded-2xl border border-white/10 p-8">
          <h1 className="font-display text-xl">You already have a store</h1>
          <p className="mt-2 text-sm text-white/60">
            Signed in as {loggedInEmail}, which already owns <strong>{existingBusiness.name}</strong>.
          </p>
          <Link
            to="/admin"
            className="mt-6 block rounded-lg bg-white py-2.5 text-sm font-medium text-black"
          >
            Go to your dashboard
          </Link>
          <button
            onClick={handleLogoutAndRegisterNew}
            className="mt-3 w-full rounded-lg border border-white/15 py-2.5 text-sm text-white/70 hover:text-white"
          >
            Not you? Log out and register a different business
          </button>
        </div>
      </div>
    )
  }

  // Already signed in but no business yet (e.g. confirmed email, came back to finish up).
  if (loggedInEmail && !existingBusiness) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0b] px-5 text-[#e8e8e6]">
        <form onSubmit={handleCompleteRegistration} className="w-full max-w-sm rounded-2xl border border-white/10 p-8">
          <h1 className="font-display text-2xl">Finish setting up your store</h1>
          <p className="mt-1 text-sm text-white/50">Signed in as {loggedInEmail}</p>

          <div className="mt-6 space-y-4">
            <div>
              <label className="mb-1 block text-sm text-white/60">Business name</label>
              <input
                required
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full rounded-lg border border-white/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-white/40"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-white/60">WhatsApp number (e.g. 254712345678)</label>
              <input
                required
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                className="w-full rounded-lg border border-white/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-white/40"
              />
            </div>
          </div>

          {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={busy}
            className="mt-6 w-full rounded-lg bg-white py-2.5 text-sm font-medium text-black disabled:opacity-50"
          >
            {busy ? 'Setting up...' : 'Create my store'}
          </button>
        </form>
      </div>
    )
  }

  // Not signed in at all - full signup form.
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a0b] px-5 py-10 text-[#e8e8e6]">
      <form onSubmit={handleSignUpAndRegister} className="w-full max-w-sm rounded-2xl border border-white/10 p-8">
        <h1 className="font-display text-2xl">Register your business</h1>
        <p className="mt-1 text-sm text-white/50">Start selling on MIRA</p>

        <div className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm text-white/60">Business name</label>
            <input
              required
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="w-full rounded-lg border border-white/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-white/40"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-white/60">WhatsApp number (e.g. 254712345678)</label>
            <input
              required
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
              className="w-full rounded-lg border border-white/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-white/40"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-white/60">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-white/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-white/40"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-white/60">Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-white/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-white/40"
            />
          </div>
        </div>

        {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
        {notice && <p className="mt-4 text-sm text-yellow-400">{notice}</p>}

        <button
          type="submit"
          disabled={busy}
          className="mt-6 w-full rounded-lg bg-white py-2.5 text-sm font-medium text-black disabled:opacity-50"
        >
          {busy ? 'Setting up...' : 'Create my store'}
        </button>

        <p className="mt-5 text-center text-sm text-white/50">
          Already have a store? <Link to="/login" className="text-white hover:underline">Sign in</Link>
        </p>
      </form>
    </div>
  )
}

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { fetchMyBusiness, registerBusiness } from '@/services/businesses'

export default function Register() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [whatsappNumber, setWhatsappNumber] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError('')
    setNotice('')

    try {
      const { data: existing } = await supabase.auth.getUser()

      if (!existing.user) {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({ email, password })
        if (signUpError) throw signUpError

        if (!signUpData.session) {
          setNotice('Check your email to confirm your account, then come back here and sign in to finish setting up your store.')
          setBusy(false)
          return
        }
      }

      const alreadyHasBusiness = await fetchMyBusiness()
      if (alreadyHasBusiness) {
        navigate('/admin')
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

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a0b] px-5 py-10 text-[#e8e8e6]">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-2xl border border-white/10 p-8">
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

import { useBusiness } from '@/contexts/BusinessContext'

export default function About() {
  const { business } = useBusiness()

  return (
    <div className="mx-auto max-w-2xl px-5 py-16">
      <h1 className="font-display text-3xl text-ink">About {business?.name}</h1>
      <div className="mt-6 space-y-4 text-stone">
        <p>{business?.description || 'No description yet.'}</p>
        {business?.location && <p>Find us at {business.location}.</p>}
        {business?.opening_hours && <p>Opening hours: {business.opening_hours}</p>}
        <p>Browse the collection, save the pieces you like, then message us on WhatsApp to order.</p>
      </div>
    </div>
  )
}

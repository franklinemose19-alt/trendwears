import { Link } from 'react-router-dom'

interface Props {
  used: number
  limit: number
  planName: string
  upgrade?: { name: string; limit: number; href?: string } | null
}

export default function ImageUsageBar({ used, limit, planName, upgrade }: Props) {
  if (limit <= 0) {
    return (
      <div className="rounded-xl border border-white/10 p-4 text-sm text-white/60">
        Image uploads are not available on the {planName} plan.
      </div>
    )
  }

  const over = used > limit
  const remaining = Math.max(0, limit - used)
  const pct = Math.min(100, Math.round((used / limit) * 100))
  const barColor = over ? 'bg-red-400' : pct >= 90 ? 'bg-yellow-400' : 'bg-green-400'

  return (
    <div className="rounded-xl border border-white/10 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
        <span>{used} / {limit} images used</span>
        <span className={over ? 'text-red-400' : 'text-white/50'}>
          {over ? 'Over your ' + planName + ' allowance' : remaining + ' remaining'}
        </span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
        <div className={'h-full rounded-full ' + barColor} style={{ width: pct + '%' }} />
      </div>

      {over && (
        <p className="mt-3 text-xs text-red-400">
          You have {used - limit} more images than the {planName} plan allows. Nothing has been deleted, but you
          cannot upload more until you remove {used - limit} or upgrade.
        </p>
      )}
      {!over && remaining === 0 && (
        <p className="mt-3 text-xs text-yellow-400">
          You have used your whole {planName} allowance. Remove an image to free space.
        </p>
      )}
      {upgrade && (used >= limit * 0.9) && (
        <p className="mt-2 text-xs text-white/60">
          Need more? {upgrade.name} allows {upgrade.limit} active images.{' '}
          {upgrade.href && <Link to={upgrade.href} className="underline hover:text-white">See upgrade options</Link>}
        </p>
      )}
    </div>
  )
}

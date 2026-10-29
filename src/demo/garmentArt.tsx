import type { ReactElement } from 'react'

export type ArtKind =
  | 'tee' | 'polo' | 'shirt' | 'hoodie' | 'dress' | 'pants' | 'skirt'
  | 'sneaker' | 'heel' | 'bag' | 'cap' | 'belt'

function clamp(n: number) {
  return Math.max(0, Math.min(255, Math.round(n)))
}

// Mixes a #rrggbb colour towards black (amount < 0) or white (amount > 0).
export function shade(hex: string, amount: number): string {
  const n = parseInt(hex.slice(1), 16)
  const r = (n >> 16) & 255
  const g = (n >> 8) & 255
  const b = n & 255
  const target = amount < 0 ? 0 : 255
  const strength = Math.abs(amount)
  const mix = (c: number) => clamp(c + (target - c) * strength)
  return '#' + [mix(r), mix(g), mix(b)].map((v) => v.toString(16).padStart(2, '0')).join('')
}

type Shape = (fill: string, dark: string, light: string) => ReactElement

const TEE_BODY = 'M62 48 L84 38 Q100 52 116 38 L138 48 L168 80 L148 100 L134 90 L134 198 Q134 204 128 204 L72 204 Q66 204 66 198 L66 90 L52 100 L32 80 Z'

const SHAPES: Record<ArtKind, Shape> = {
  tee: (c) => (
    <>
      <path d={TEE_BODY} fill={c} />
      <path d="M84 38 Q100 58 116 38" fill="none" />
    </>
  ),
  polo: (c, d, l) => (
    <>
      <path d={TEE_BODY} fill={c} />
      <path d="M84 38 L100 64 L90 36 Z" fill={l} />
      <path d="M116 38 L100 64 L110 36 Z" fill={l} />
      <path d="M100 64 L100 104" fill="none" />
      <circle cx="100" cy="78" r="1.8" fill={d} />
      <circle cx="100" cy="92" r="1.8" fill={d} />
    </>
  ),
  shirt: (c, d, l) => (
    <>
      <path d="M60 44 L84 36 Q100 50 116 36 L140 44 L176 152 L156 158 L134 92 L134 206 L66 206 L66 92 L44 158 L24 152 Z" fill={c} />
      <path d="M84 36 L100 62 L90 34 Z" fill={l} />
      <path d="M116 36 L100 62 L110 34 Z" fill={l} />
      <path d="M100 62 L100 206" fill="none" />
      {[80, 104, 128, 152, 176].map((y) => <circle key={y} cx="100" cy={y} r="1.8" fill={d} />)}
    </>
  ),
  hoodie: (c, d, l) => (
    <>
      <path d="M58 62 L80 46 Q100 28 120 46 L142 62 L178 152 L156 164 L138 104 L138 204 L62 204 L62 104 L44 164 L22 152 Z" fill={c} />
      <path d="M80 46 Q100 78 120 46 Q100 40 80 46 Z" fill={l} />
      <path d="M92 70 L90 108 M108 70 L110 108" fill="none" />
      <path d="M76 150 L124 150 L118 184 L82 184 Z" fill={c} />
    </>
  ),
  dress: (c, d) => (
    <>
      <path d="M78 30 Q100 46 122 30 L136 42 L129 98 Q152 142 162 216 Q100 230 38 216 Q48 142 71 98 L64 42 Z" fill={c} />
      <path d="M86 34 L100 74 L114 34" fill="none" />
      <path d="M71 98 L129 98" fill="none" />
      <path d="M100 98 L100 218" fill="none" opacity="0.35" />
      <circle cx="100" cy="98" r="2" fill={d} />
    </>
  ),
  pants: (c, d) => (
    <>
      <path d="M66 30 L134 30 L141 62 L152 216 L113 216 L100 94 L87 216 L48 216 L59 62 Z" fill={c} />
      <path d="M66 42 L134 42" fill="none" />
      <path d="M100 42 L100 94" fill="none" />
      <path d="M72 62 Q80 74 90 70 M128 62 Q120 74 110 70" fill="none" opacity="0.6" />
      <circle cx="100" cy="42" r="2" fill={d} />
    </>
  ),
  skirt: (c) => (
    <>
      <path d="M72 58 L128 58 L172 212 Q100 226 28 212 Z" fill={c} />
      <path d="M72 58 L128 58 L128 70 L72 70 Z" fill="none" />
      <path d="M86 70 L60 216 M100 70 L100 220 M114 70 L140 216" fill="none" opacity="0.55" />
    </>
  ),
  sneaker: (c, d, l) => (
    <>
      <path d="M22 156 Q22 116 60 110 L92 124 Q120 106 152 122 Q186 132 186 164 L186 184 L22 184 Z" fill={c} />
      <path d="M22 168 L186 168 L186 188 Q186 194 180 194 L28 194 Q22 194 22 188 Z" fill="#ffffff" />
      <path d="M96 124 L110 140 M110 118 L124 134 M124 116 L138 130" fill="none" />
      <path d="M22 156 Q40 150 56 156" fill="none" opacity="0.5" />
      <path d="M150 140 Q170 146 176 160" fill={l} opacity="0.6" />
    </>
  ),
  heel: (c, d) => (
    <>
      <path d="M30 172 Q70 150 90 110 L114 100 Q120 140 152 150 L178 158 Q186 166 178 174 L132 174 L130 212 L116 212 L112 178 L40 186 Q28 186 30 172 Z" fill={c} />
      <path d="M112 100 Q132 114 150 112" fill="none" />
      <circle cx="123" cy="143" r="2" fill={d} />
    </>
  ),
  bag: (c) => (
    <>
      <path d="M72 92 Q72 42 100 42 Q128 42 128 92" fill="none" strokeWidth="5" />
      <path d="M48 92 L152 92 L160 208 L40 208 Z" fill={c} />
      <path d="M48 92 L152 92" fill="none" />
      <path d="M70 120 L130 120" fill="none" opacity="0.5" />
    </>
  ),
  cap: (c, d) => (
    <>
      <path d="M44 132 Q44 62 100 62 Q156 62 156 132 Z" fill={c} />
      <path d="M44 132 Q100 152 178 140 Q172 154 100 160 Q52 160 44 132 Z" fill={c} />
      <path d="M100 62 L100 132" fill="none" opacity="0.5" />
      <circle cx="100" cy="64" r="3" fill={d} />
    </>
  ),
  belt: (c, d) => (
    <>
      <rect x="18" y="108" width="164" height="24" rx="5" fill={c} />
      <rect x="82" y="100" width="28" height="40" rx="4" fill="none" strokeWidth="4" />
      <path d="M110 120 L132 120" fill="none" />
      {[140, 152, 164].map((x) => <circle key={x} cx={x} cy="120" r="2" fill={d} />)}
    </>
  ),
}

export const ART_KINDS = Object.keys(SHAPES) as ArtKind[]

interface Props {
  kind: ArtKind
  colour: string
  label: string
  className?: string
}

// A clean illustration of a garment in the chosen colour. Used where a real photo is not available.
export default function GarmentArt({ kind, colour, label, className }: Props) {
  const dark = shade(colour, -0.3)
  const light = shade(colour, 0.3)
  return (
    <svg viewBox="0 0 200 240" role="img" aria-label={label} className={className} xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="240" fill="#f1eee7" />
      <ellipse cx="100" cy="228" rx="62" ry="6" fill="#000000" opacity="0.08" />
      <g stroke={dark} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round">
        {SHAPES[kind](colour, dark, light)}
      </g>
    </svg>
  )
}

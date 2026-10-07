import { useId, useMemo, useState, type CSSProperties } from 'react'
import './DayNightToggle.css'

export interface DayNightToggleProps {
  /** Mode contrôlé : `true` = nuit. */
  checked?: boolean
  /** Mode non contrôlé : état initial (`true` = nuit). */
  defaultChecked?: boolean
  /** Appelé à chaque bascule avec le nouvel état (`true` = nuit). */
  onChange?: (isNight: boolean) => void
  /** Largeur du bouton (nombre = px, ou toute valeur CSS). Le ratio reste 2:1. */
  width?: number | string
  /** Durée de la transition jour/nuit, en secondes. */
  duration?: number
  className?: string
  style?: CSSProperties
  'aria-label'?: string
}

// PRNG déterministe : même rendu côté serveur et client (pas de mismatch d'hydratation).
function mulberry32(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function useScenery() {
  return useMemo(() => {
    const rand = mulberry32(1337)
    const r = (a: number, b: number) => a + rand() * (b - a)

    const stars = Array.from({ length: 70 }, () => ({
      cx: r(4, 416),
      cy: r(3, 100),
      r: rand() < 0.15 ? r(1, 1.5) : r(0.35, 0.9),
      duration: r(2, 5),
      delay: -r(0, 5),
    }))

    const rays = Array.from({ length: 16 }, (_, i) => {
      const a = (i * Math.PI) / 8
      const r2 = i % 2 ? 29 : 37
      return {
        x1: 300 + Math.cos(a) * 21,
        y1: 60 + Math.sin(a) * 21,
        x2: 300 + Math.cos(a) * r2,
        y2: 60 + Math.sin(a) * r2,
      }
    })

    const shimmer = Array.from({ length: 34 }, () => {
      const y = 136 + Math.pow(rand(), 1.2) * 70
      const w = 6 + (y - 132) * 0.22
      const x = r(10, 410)
      return { x, y, w, duration: r(2.5, 6), delay: -r(0, 6) }
    })

    const fireflies = Array.from({ length: 14 }, () => ({
      cx: r(10, 410),
      cy: r(112, 175),
      r: r(0.8, 1.4),
      dx: r(-18, 18),
      dy: r(-14, 14),
      floatDuration: r(4, 8),
      blinkDelay: -r(0, 3),
      floatDelay: -r(0, 6),
      blinkDuration: r(1.8, 3.6),
    }))

    return { stars, rays, shimmer, fireflies }
  }, [])
}

const GLINTS = [
  { cy: 138, rx: 9, ry: 1.6, delay: -0.2 },
  { cy: 146, rx: 15, ry: 1.8, delay: -0.9 },
  { cy: 156, rx: 22, ry: 2, delay: -1.6 },
  { cy: 168, rx: 28, ry: 2.2, delay: -0.5 },
  { cy: 182, rx: 32, ry: 2.2, delay: -1.2 },
  { cy: 198, rx: 36, ry: 2.2, delay: -2 },
]

const PINES = [
  [16, 130, 1.15],
  [36, 133, 0.95],
  [54, 131, 1.3],
  [76, 134, 0.8],
  [396, 131, 1.25],
  [378, 134, 0.9],
  [412, 134, 1.05],
  [358, 135, 0.7],
] as const

export function DayNightToggle({
  checked,
  defaultChecked = false,
  onChange,
  width,
  duration = 1.6,
  className,
  style,
  'aria-label': ariaLabel = 'Basculer entre le jour et la nuit',
}: DayNightToggleProps) {
  const [inner, setInner] = useState(defaultChecked)
  const isNight = checked ?? inner
  const scenery = useScenery()

  // Les ids SVG doivent être uniques si plusieurs toggles sont sur la même page.
  const uid = useId().replace(/:/g, '')
  const id = (name: string) => `dnt-${uid}-${name}`
  const url = (name: string) => `url(#${id(name)})`

  const toggle = () => {
    const next = !isNight
    if (checked === undefined) setInner(next)
    onChange?.(next)
  }

  const rootStyle = {
    '--dnt-t': `${duration}s`,
    ...(width !== undefined && { width: typeof width === 'number' ? `${width}px` : width }),
    ...style,
  } as CSSProperties

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isNight}
      aria-label={ariaLabel}
      data-night={isNight}
      className={['dnt', className].filter(Boolean).join(' ')}
      style={rootStyle}
      onClick={toggle}
    >
      <svg viewBox="0 0 420 210" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
          <linearGradient id={id('sky')} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" style={{ stopColor: 'var(--dnt-sky-top)' }} />
            <stop offset=".55" style={{ stopColor: 'var(--dnt-sky-mid)' }} />
            <stop offset="1" style={{ stopColor: 'var(--dnt-sky-bot)' }} />
          </linearGradient>
          <linearGradient id={id('lake')} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" style={{ stopColor: 'var(--dnt-lake-top)' }} />
            <stop offset="1" style={{ stopColor: 'var(--dnt-lake-bot)' }} />
          </linearGradient>
          <radialGradient id={id('sunG')}>
            <stop offset="0" stopColor="#fffbe6" />
            <stop offset=".35" stopColor="#ffe27a" />
            <stop offset="1" stopColor="#ff9d2e" />
          </radialGradient>
          <radialGradient id={id('sunHalo')}>
            <stop offset="0" stopColor="#fff2b0" stopOpacity=".95" />
            <stop offset=".4" stopColor="#ffd36b" stopOpacity=".35" />
            <stop offset="1" stopColor="#ffd36b" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={id('moonG')} cx=".38" cy=".35">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset=".7" stopColor="#e3e9f7" />
            <stop offset="1" stopColor="#b9c3de" />
          </radialGradient>
          <radialGradient id={id('moonHalo')}>
            <stop offset="0" stopColor="#cfdcff" stopOpacity=".7" />
            <stop offset=".45" stopColor="#8fa8ff" stopOpacity=".2" />
            <stop offset="1" stopColor="#8fa8ff" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={id('fade')} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity="0" />
            <stop offset="1" stopColor="#fff" stopOpacity=".9" />
          </linearGradient>
          <mask id={id('mfade')}>
            <rect
              x="0"
              y="132"
              width="420"
              height="78"
              fill={url('fade')}
              transform="translate(0,342) scale(1,-1)"
            />
          </mask>
          <clipPath id={id('lakeClip')}>
            <rect x="0" y="132" width="420" height="78" />
          </clipPath>
          <filter id={id('blur2')}>
            <feGaussianBlur stdDeviation="2.4" />
          </filter>
          <filter id={id('blur6')}>
            <feGaussianBlur stdDeviation="6" />
          </filter>
          <filter id={id('ripple')} x="-5%" y="-5%" width="110%" height="110%">
            <feTurbulence type="fractalNoise" baseFrequency="0.004 0.16" numOctaves="2" seed="3" result="n">
              <animate
                attributeName="baseFrequency"
                dur="9s"
                repeatCount="indefinite"
                values="0.004 0.16;0.007 0.2;0.004 0.16"
              />
            </feTurbulence>
            <feDisplacementMap in="SourceGraphic" in2="n" scale="7" xChannelSelector="R" yChannelSelector="G" />
            <feGaussianBlur stdDeviation=".5" />
          </filter>

          <symbol id={id('pine')} overflow="visible">
            <path d="M0 -30 L7 -14 L3.5 -14 L10 -2 L5 -2 L12 8 L-12 8 L-5 -2 L-10 -2 L-3.5 -14 L-7 -14 Z" />
            <rect x="-1.5" y="8" width="3" height="5" />
          </symbol>

          <g id={id('scene')}>
            <path
              className="dnt-far"
              d="M-5 140 L-5 98 L35 78 L66 96 L106 62 L148 94 L188 74 L228 98 L272 58 L322 96 L362 74 L425 104 L425 140Z"
            />
            <path
              className="dnt-main"
              d="M-10 140 L84 76 L128 92 L192 20 L216 46 L238 38 L304 102 L342 88 L430 140Z"
            />
            <path
              className="dnt-shade"
              d="M192 20 L216 46 L238 38 L304 102 L342 88 L430 140 L215 140 L204 84 L196 56Z"
            />
            <path className="dnt-snow" d="M192 20 L170 52 L181 47 L189 59 L199 48 L208 58 L216 46 L206 36 Z" />
            <path className="dnt-snow" opacity=".9" d="M238 38 L224 60 L232 56 L238 64 L246 54 L252 58 Z" />
            <path className="dnt-hill" d="M-5 140 L-5 118 Q50 102 120 118 T250 114 T425 118 L425 140Z" />
            <g className="dnt-pine">
              {PINES.map(([x, y, s]) => (
                <use key={x} href={`#${id('pine')}`} transform={`translate(${x},${y}) scale(${s})`} />
              ))}
            </g>
          </g>
        </defs>

        {/* ciel */}
        <rect width="420" height="210" fill={url('sky')} />

        {/* étoiles + étoile filante */}
        <g className="dnt-stars">
          {scenery.stars.map((s, i) => (
            <circle
              key={i}
              className="dnt-star"
              cx={s.cx}
              cy={s.cy}
              r={s.r}
              fill="#fff"
              style={{ animationDuration: `${s.duration}s`, animationDelay: `${s.delay}s` }}
            />
          ))}
          <g className="dnt-shoot">
            <line x1="300" y1="20" x2="330" y2="6" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" />
            <circle cx="300" cy="20" r="1.4" fill="#fff" />
          </g>
        </g>

        {/* soleil */}
        <g className="dnt-sun">
          <circle className="dnt-sunglow" cx="300" cy="60" r="62" fill={url('sunHalo')} />
          <g className="dnt-rays" stroke="#fff3b8" strokeWidth="1.4" strokeLinecap="round" opacity=".55">
            {scenery.rays.map((l, i) => (
              <line key={i} {...l} />
            ))}
          </g>
          <circle cx="300" cy="60" r="15" fill={url('sunG')} />
        </g>

        {/* lune */}
        <g className="dnt-moon">
          <circle cx="118" cy="52" r="56" fill={url('moonHalo')} />
          <circle cx="118" cy="52" r="17" fill={url('moonG')} />
          <g fill="#9aa6c6" opacity=".55">
            <circle cx="112" cy="46" r="3.6" />
            <circle cx="124" cy="58" r="4.4" />
            <circle cx="121" cy="43" r="2" />
            <circle cx="109" cy="58" r="2.2" />
            <circle cx="127" cy="49" r="1.4" />
          </g>
        </g>

        {/* nuages */}
        <g className="dnt-clouds" filter={url('blur2')} opacity=".92">
          <g className="dnt-c" style={{ animationDuration: '70s', animationDelay: '-30s' }}>
            <g className="dnt-cloud">
              <ellipse cx="60" cy="38" rx="26" ry="7" />
              <ellipse cx="74" cy="32" rx="16" ry="8" />
              <ellipse cx="48" cy="33" rx="12" ry="6" />
            </g>
          </g>
          <g className="dnt-c" style={{ animationDuration: '95s', animationDelay: '-70s' }}>
            <g className="dnt-cloud" opacity=".85">
              <ellipse cx="60" cy="72" rx="34" ry="6" />
              <ellipse cx="78" cy="67" rx="18" ry="7" />
            </g>
          </g>
          <g className="dnt-c" style={{ animationDuration: '55s', animationDelay: '-10s' }}>
            <g className="dnt-cloud" opacity=".8">
              <ellipse cx="60" cy="18" rx="22" ry="5" />
              <ellipse cx="68" cy="14" rx="12" ry="5" />
            </g>
          </g>
        </g>

        {/* brume à l'horizon */}
        <ellipse cx="210" cy="124" rx="260" ry="14" fill="var(--dnt-haze)" opacity=".22" filter={url('blur6')} />

        {/* paysage */}
        <use href={`#${id('scene')}`} />

        {/* lac */}
        <rect x="0" y="132" width="420" height="78" fill={url('lake')} />
        <g clipPath={url('lakeClip')}>
          <g mask={url('mfade')} opacity=".75">
            <g filter={url('ripple')}>
              <g transform="translate(0,264) scale(1,-1)">
                <use href={`#${id('scene')}`} />
              </g>
            </g>
          </g>
          <g className="dnt-glint" filter={url('blur2')}>
            {GLINTS.map((g) => (
              <ellipse
                key={g.cy}
                className="dnt-gl"
                cx="300"
                cy={g.cy}
                rx={g.rx}
                ry={g.ry}
                style={{ animationDelay: `${g.delay}s` }}
              />
            ))}
          </g>
          <g className="dnt-shimmer" strokeWidth="1">
            {scenery.shimmer.map((s, i) => (
              <line
                key={i}
                x1={s.x - s.w}
                x2={s.x + s.w}
                y1={s.y}
                y2={s.y}
                style={{
                  transformOrigin: `${s.x}px ${s.y}px`,
                  animationDuration: `${s.duration}s`,
                  animationDelay: `${s.delay}s`,
                }}
              />
            ))}
          </g>
        </g>

        {/* oiseaux */}
        <g className="dnt-birds">
          {[
            { d: 22, delay: -6, y: 0 },
            { d: 26, delay: -14, y: 22 },
            { d: 30, delay: -2, y: -6 },
          ].map((b) => (
            <g
              key={b.d}
              transform={`translate(0,${b.y})`}
            >
              <g className="dnt-bird" style={{ animationDuration: `${b.d}s`, animationDelay: `${b.delay}s` }}>
                <path d="M0 40 q3 -4 6 0 q3 -4 6 0" />
              </g>
            </g>
          ))}
        </g>

        {/* lucioles */}
        <g className="dnt-flies">
          {scenery.fireflies.map((f, i) => (
            <circle
              key={i}
              className="dnt-fly"
              cx={f.cx}
              cy={f.cy}
              r={f.r}
              style={
                {
                  '--dx': `${f.dx}px`,
                  '--dy': `${f.dy}px`,
                  animationDuration: `${f.floatDuration}s, ${f.blinkDuration}s`,
                  animationDelay: `${f.floatDelay}s, ${f.blinkDelay}s`,
                } as CSSProperties
              }
            />
          ))}
        </g>
      </svg>
    </button>
  )
}


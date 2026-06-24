import { useEffect, useRef, useState } from 'react'
import { useTimelineStore } from '../store/timelineStore'

const DEMON_COLORS = {
  'Easy Demon': '#00ff00',
  'Medium Demon': '#ffff00',
  'Hard Demon': '#ff6600',
  'Insane Demon': '#ff0000',
  'Extreme Demon': '#ff00ff',
}

const FEATURES = [
  {
    title: '3D Timeline',
    desc: 'Demons rendered on a spatial axis with glowing connections and difficulty-coded orbs.',
  },
  {
    title: 'Cloud Sync',
    desc: 'Sign in to save your progression across devices via Supabase.',
  },
  {
    title: 'YouTube Player',
    desc: 'Embedded showcase viewer with video and sound-only modes.',
  },
  {
    title: 'Statistics',
    desc: 'Completion tracking, streaks, per-difficulty progress, and more.',
  },
]

function ParticleCanvas() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animId
    let w, h

    const particles = Array.from({ length: 120 }, () => ({
      x: Math.random(),
      y: Math.random(),
      vx: (Math.random() - 0.5) * 0.002,
      vy: (Math.random() - 0.5) * 0.002,
      size: 0.5 + Math.random() * 1.5,
      alpha: 0.1 + Math.random() * 0.4,
    }))

    function resize() {
      w = canvas.width = window.innerWidth
      h = canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    function draw() {
      ctx.clearRect(0, 0, w, h)
      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0 || p.x > 1) p.vx *= -1
        if (p.y < 0 || p.y > 1) p.vy *= -1
        ctx.beginPath()
        ctx.arc(p.x * w, p.y * h, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(207, 188, 255, ${p.alpha})`
        ctx.fill()
      }

      const lines = []
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 0.06) {
            lines.push({ i, j, alpha: 1 - dist / 0.06 })
          }
        }
      }
      for (const l of lines) {
        const a = particles[l.i]
        const b = particles[l.j]
        ctx.beginPath()
        ctx.moveTo(a.x * w, a.y * h)
        ctx.lineTo(b.x * w, b.y * h)
        ctx.strokeStyle = `rgba(207, 188, 255, ${l.alpha * 0.15})`
        ctx.lineWidth = 0.5
        ctx.stroke()
      }

      animId = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  )
}

function DemonIcon({ color, size = 8 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 8 8">
      <rect x="1" y="1" width="6" height="6" rx="1" fill={color} opacity={0.9} />
      <circle cx="3" cy="3" r="0.8" fill="#0a0a0a" />
      <circle cx="5" cy="3" r="0.8" fill="#0a0a0a" />
      <path d="M2.5 5.5 Q4 6.5 5.5 5.5" stroke="#0a0a0a" strokeWidth="0.5" fill="none" />
    </svg>
  )
}

function LandingPage({ onEnter }) {
  const [fadeOut, setFadeOut] = useState(false)
  const demons = useTimelineStore((s) => s.demons)
  const beaten = demons.filter((d) => d.progress === 100).length
  const total = demons.length

  const handleEnter = () => {
    setFadeOut(true)
    setTimeout(() => onEnter(), 500)
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: '#0a0a0a',
        color: '#e6e0e9',
        fontFamily: 'Inter, system-ui, sans-serif',
        overflow: 'auto',
        opacity: fadeOut ? 0 : 1,
        transition: 'opacity 0.5s ease',
      }}
    >
      <ParticleCanvas />

      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '48px 20px',
          gap: 48,
        }}
      >
        {/* Hero */}
        <div style={{ textAlign: 'center', maxWidth: 640 }}>
          <div
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 'clamp(36px, 8vw, 72px)',
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              color: '#e6e0e9',
              marginBottom: 4,
              textShadow: '0 0 40px rgba(207,188,255,0.3), 0 0 80px rgba(207,188,255,0.1)',
            }}
          >
            GD DEMON
            <br />
            TIMELINE
          </div>
          <div
            style={{
              fontSize: 'clamp(14px, 2.5vw, 20px)',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 400,
              color: '#cbc4d2',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              marginTop: 12,
            }}
          >
            Geometry Dash Demon Timeline
          </div>

          {/* Difficulty bar */}
          <div
            style={{
              display: 'flex',
              gap: 8,
              justifyContent: 'center',
              marginTop: 20,
              flexWrap: 'wrap',
            }}
          >
            {Object.entries(DEMON_COLORS).map(([name, color]) => (
              <div
                key={name}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  fontSize: 11,
                  fontFamily: 'JetBrains Mono, monospace',
                  color: color,
                  letterSpacing: '0.05em',
                }}
              >
                <DemonIcon color={color} />
                {name.replace(' Demon', '')}
              </div>
            ))}
          </div>
        </div>

        {/* Features */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 16,
            maxWidth: 960,
            width: '100%',
          }}
        >
          {FEATURES.map((f) => (
            <div
              key={f.title}
              style={{
                background: 'rgba(255,255,255,0.03)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                borderTop: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 4,
                padding: 20,
              }}
            >
              <div
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#cfbcff',
                  marginBottom: 6,
                  letterSpacing: '0.02em',
                }}
              >
                {f.title}
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: '#cbc4d2',
                  lineHeight: 1.5,
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                {f.desc}
              </div>
            </div>
          ))}
        </div>

        {/* Stats + CTA */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
          {total > 0 && (
            <div
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 12,
                color: '#948e9c',
                letterSpacing: '0.05em',
              }}
            >
              {total} demons · {beaten} beaten · {total > 0 ? Math.round((beaten / total) * 100) : 0}%
            </div>
          )}

          <button
            onClick={handleEnter}
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 16,
              fontWeight: 600,
              letterSpacing: '0.08em',
              padding: '14px 48px',
              border: '1px solid #cfbcff',
              borderRadius: 4,
              background: '#cfbcff',
              color: '#0a0a0a',
              cursor: 'pointer',
              textTransform: 'uppercase',
              transition: 'box-shadow 0.2s, transform 0.15s',
              boxShadow: '0 0 20px rgba(207,188,255,0.25)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 0 40px rgba(207,188,255,0.45)'
              e.currentTarget.style.transform = 'scale(1.03)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 0 20px rgba(207,188,255,0.25)'
              e.currentTarget.style.transform = 'scale(1)'
            }}
          >
            Enter Timeline
          </button>
        </div>

        {/* Footer */}
        <div
          style={{
            fontSize: 11,
            color: '#494551',
            fontFamily: 'JetBrains Mono, monospace',
            textAlign: 'center',
          }}
        >
          React 19 · Three.js · Zustand · Supabase · Cloudflare Pages
        </div>
      </div>
    </div>
  )
}

export default LandingPage

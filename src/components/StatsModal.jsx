import { createPortal } from 'react-dom'

const DIFFICULTY_COLORS = {
  'Easy Demon': '#00ff00',
  'Medium Demon': '#ffff00',
  'Hard Demon': '#ff6600',
  'Insane Demon': '#ff0000',
  'Extreme Demon': '#ff00ff',
}

const DIFFICULTY_ORDER = ['Easy Demon', 'Medium Demon', 'Hard Demon', 'Insane Demon', 'Extreme Demon']

function StatBar({ label, value, max, color }) {
  const pct = max > 0 ? (value / max) * 100 : 0
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 2 }}>
        <span style={{ opacity: 0.7 }}>{label}</span>
        <span style={{ opacity: 0.5 }}>{value}/{max}</span>
      </div>
      <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color || '#c084fc', borderRadius: 3, transition: 'width 0.3s' }} />
      </div>
    </div>
  )
}

function StatsModal({ demons, onClose }) {
  const total = demons.length
  const beaten = demons.filter((d) => d.progress === 100).length
  const future = demons.filter((d) => d.progress === 0).length
  const pctComplete = total > 0 ? Math.round((beaten / total) * 100) : 0

  const byDifficulty = {}
  for (const d of DIFFICULTY_ORDER) {
    const all = demons.filter((dd) => dd.difficulty === d)
    const beat = all.filter((dd) => dd.progress === 100)
    byDifficulty[d] = { total: all.length, beaten: beat.length }
  }

  const allBeatenDates = demons
    .filter((d) => d.progress === 100 && d.dateBeaten && d.dateBeaten !== 'N/A')
    .map((d) => ({ name: d.name, date: new Date(d.dateBeaten) }))
    .sort((a, b) => a.date - b.date)

  const streak = allBeatenDates.length > 0 ? (() => {
    let longest = 1
    let current = 1
    for (let i = 1; i < allBeatenDates.length; i++) {
      const diff = (allBeatenDates[i].date - allBeatenDates[i - 1].date) / (1000 * 60 * 60 * 24)
      if (diff <= 1) {
        current++
        longest = Math.max(longest, current)
      } else {
        current = 1
      }
    }
    return longest
  })() : 0

  return createPortal(
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#0d001a',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: 12,
          padding: 24,
          fontFamily: 'monospace',
          color: 'white',
          width: 'min(420px, 92vw)',
          maxHeight: '80vh',
          overflowY: 'auto',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ margin: 0, fontSize: 16, color: '#c084fc' }}>
            Statistics
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(255,255,255,0.4)',
              fontSize: 16,
              cursor: 'pointer',
              padding: '4px 8px',
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
          <div style={{ flex: 1, textAlign: 'center', padding: '10px 8px', background: 'rgba(255,255,255,0.04)', borderRadius: 8 }}>
            <div style={{ fontSize: 24, fontWeight: 'bold', color: '#c084fc' }}>{total}</div>
            <div style={{ fontSize: 10, opacity: 0.5, marginTop: 2 }}>Total</div>
          </div>
          <div style={{ flex: 1, textAlign: 'center', padding: '10px 8px', background: 'rgba(74,222,128,0.08)', borderRadius: 8 }}>
            <div style={{ fontSize: 24, fontWeight: 'bold', color: '#4ade80' }}>{beaten}</div>
            <div style={{ fontSize: 10, opacity: 0.5, marginTop: 2 }}>Beaten</div>
          </div>
          <div style={{ flex: 1, textAlign: 'center', padding: '10px 8px', background: 'rgba(255,255,255,0.04)', borderRadius: 8 }}>
            <div style={{ fontSize: 24, fontWeight: 'bold', color: '#888' }}>{future}</div>
            <div style={{ fontSize: 10, opacity: 0.5, marginTop: 2 }}>Future</div>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 28, fontWeight: 'bold', color: pctComplete >= 50 ? '#4ade80' : '#c084fc' }}>{pctComplete}%</div>
          <div style={{ fontSize: 10, opacity: 0.5 }}>Completion</div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 'bold', marginBottom: 8, color: 'rgba(255,255,255,0.7)' }}>By Difficulty</div>
          {DIFFICULTY_ORDER.map((diff) =>
            byDifficulty[diff].total > 0 ? (
              <StatBar
                key={diff}
                label={diff}
                value={byDifficulty[diff].beaten}
                max={byDifficulty[diff].total}
                color={DIFFICULTY_COLORS[diff]}
              />
            ) : null
          )}
        </div>

        {streak > 1 && (
          <div style={{ padding: '10px 12px', background: 'rgba(192,132,252,0.1)', borderRadius: 8, border: '1px solid rgba(192,132,252,0.2)' }}>
            <div style={{ fontSize: 11, opacity: 0.6 }}>Longest Daily Streak</div>
            <div style={{ fontSize: 20, fontWeight: 'bold', color: '#c084fc' }}>{streak} days</div>
          </div>
        )}

        {allBeatenDates.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 'bold', marginBottom: 6, color: 'rgba(255,255,255,0.7)' }}>Recent Beaten</div>
            {allBeatenDates.slice(-5).reverse().map((d) => (
              <div key={d.name} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, opacity: 0.6, marginBottom: 2 }}>
                <span>{d.name}</span>
                <span>{d.date.toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}

export default StatsModal

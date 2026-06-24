import { useState } from 'react'
import { useTimelineStore } from '../store/timelineStore'

const SETTINGS = [
  { key: 'starfield', label: 'Starfield', desc: 'Twinkelende sterren achtergrond' },
  { key: 'nebula', label: 'Nebula Clouds', desc: 'Nevelachtige wolken partikels' },
  { key: 'floatingParticles', label: 'Floating Particles', desc: 'Zwevende licht partikels' },
  { key: 'shootingStars', label: 'Shooting Stars', desc: 'Vallende sterren' },
  { key: 'blackHole', label: 'Black Hole (TON 618)', desc: 'Zwart gat model aan het einde' },
  { key: 'demonLabels', label: 'Demon Name Labels', desc: 'Naam labels boven elke demon' },
  { key: 'demonRings', label: 'Demon Rings', desc: 'Draaiende ringen om demonen' },
  { key: 'demonGlow', label: 'Demon Glow', desc: 'Glow effect achter demon iconen' },
]

function SettingsModal({ onClose }) {
  const renderSettings = useTimelineStore((s) => s.renderSettings)
  const setRenderSetting = useTimelineStore((s) => s.setRenderSetting)
  const qualityMode = useTimelineStore((s) => s.qualityMode)
  const setQualityMode = useTimelineStore((s) => s.setQualityMode)
  const runPerformanceTest = useTimelineStore((s) => s.runPerformanceTest)
  const [testing, setTesting] = useState(false)

  const handleTest = async () => {
    setTesting(true)
    await runPerformanceTest()
    setTesting(false)
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 10000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.7)',
        fontFamily: 'monospace', color: 'white',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#1a0a2e',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: 12,
          padding: '24px 28px',
          minWidth: 340,
          maxWidth: 440,
        }}
      >
        <div style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 16 }}>
          ⚙️ Settings
        </div>

        <div style={{ marginBottom: 16, padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: 13, marginBottom: 8 }}>Quality Mode</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {['low', 'normal'].map((mode) => (
              <button
                key={mode}
                onClick={() => setQualityMode(mode)}
                style={{
                  flex: 1,
                  background: qualityMode === mode ? '#c084fc' : 'rgba(255,255,255,0.06)',
                  border: `1px solid ${qualityMode === mode ? '#c084fc' : 'rgba(255,255,255,0.2)'}`,
                  color: 'white',
                  padding: '6px 12px',
                  borderRadius: 6,
                  fontSize: 11,
                  fontFamily: 'monospace',
                  cursor: 'pointer',
                  fontWeight: qualityMode === mode ? 'bold' : 'normal',
                }}
              >
                {mode === 'low' ? 'Low' : 'Normal'}
              </button>
            ))}
          </div>
          <div style={{ fontSize: 10, opacity: 0.4, marginTop: 4 }}>
            Low: reduced particles, lighter bloom. Normal: full quality.
          </div>
        </div>

        <div style={{ marginBottom: 16, paddingBottom: 8, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: 13, marginBottom: 8 }}>Performance Test</div>
          <button
            onClick={handleTest}
            disabled={testing}
            style={{
              background: testing ? 'rgba(192,132,252,0.2)' : 'rgba(192,132,252,0.15)',
              border: '1px solid #c084fc',
              color: 'white',
              padding: '6px 16px',
              borderRadius: 6,
              fontSize: 11,
              fontFamily: 'monospace',
              cursor: testing ? 'default' : 'pointer',
              opacity: testing ? 0.5 : 1,
            }}
          >
            {testing ? 'Measuring...' : qualityMode === 'low' ? '⚠ Low — Retest' : '✅ Normal — Retest'}
          </button>
          <div style={{ fontSize: 10, opacity: 0.4, marginTop: 4 }}>
            Measures FPS over 3 seconds and adjusts quality automatically.
          </div>
        </div>

        <div style={{ fontSize: 13, fontWeight: 'bold', marginBottom: 8, opacity: 0.6 }}>
          Render Toggles
        </div>

        {SETTINGS.map(({ key, label, desc }) => (
          <label
            key={key}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '8px 0',
              cursor: 'pointer',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <input
              type="checkbox"
              checked={renderSettings[key]}
              onChange={() => setRenderSetting(key, !renderSettings[key])}
              style={{ accentColor: '#c084fc', width: 16, height: 16 }}
            />
            <div>
              <div style={{ fontSize: 13 }}>{label}</div>
              <div style={{ fontSize: 10, opacity: 0.4, marginTop: 2 }}>{desc}</div>
            </div>
          </label>
        ))}

        <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: 'white',
              padding: '6px 16px',
              borderRadius: 6,
              fontSize: 12,
              fontFamily: 'monospace',
              cursor: 'pointer',
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default SettingsModal

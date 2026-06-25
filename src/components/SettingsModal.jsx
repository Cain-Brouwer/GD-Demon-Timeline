import { useState } from 'react'
import { useTimelineStore } from '../store/timelineStore'
import { LEVELS, getLevelAtIndex } from '../lib/qualityConfig'

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
  const qualityLevelIndex = useTimelineStore((s) => s.qualityLevelIndex)
  const setQualityLevelIndex = useTimelineStore((s) => s.setQualityLevelIndex)
  const qualityMode = useTimelineStore((s) => s.qualityMode)
  const setQualityMode = useTimelineStore((s) => s.setQualityMode)
  const runPerformanceTest = useTimelineStore((s) => s.runPerformanceTest)
  const [testing, setTesting] = useState(false)

  const currentLevel = getLevelAtIndex(qualityLevelIndex)

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
          <div style={{ fontSize: 13, marginBottom: 8 }}>Quality Level</div>
          <div style={{ display: 'flex', gap: 6 }}>
            {LEVELS.map((level, idx) => (
              <button
                key={level}
                onClick={() => setQualityLevelIndex(idx)}
                style={{
                  flex: 1,
                  background: qualityLevelIndex === idx ? '#c084fc' : 'rgba(255,255,255,0.06)',
                  border: `1px solid ${qualityLevelIndex === idx ? '#c084fc' : 'rgba(255,255,255,0.2)'}`,
                  color: 'white',
                  padding: '6px 6px',
                  borderRadius: 6,
                  fontSize: 10,
                  fontFamily: 'monospace',
                  cursor: 'pointer',
                  fontWeight: qualityLevelIndex === idx ? 'bold' : 'normal',
                }}
              >
                {getLevelAtIndex(idx).label}
              </button>
            ))}
          </div>
          <div style={{ fontSize: 10, opacity: 0.4, marginTop: 6 }}>
            Current: <span style={{ color: '#c084fc' }}>{currentLevel.label}</span>
            {' | '}Mode: <span style={{ color: qualityMode === 'auto' ? '#4ade80' : '#fbbf24' }}>{qualityMode === 'auto' ? 'Auto' : 'Manual'}</span>
          </div>
        </div>

        <div style={{ marginBottom: 16, padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 13 }}>Mode</span>
            <button
              onClick={() => setQualityMode('auto')}
              style={{
                background: qualityMode === 'auto' ? '#4ade80' : 'rgba(255,255,255,0.06)',
                border: `1px solid ${qualityMode === 'auto' ? '#4ade80' : 'rgba(255,255,255,0.2)'}`,
                color: 'white',
                padding: '4px 12px',
                borderRadius: 6,
                fontSize: 11,
                fontFamily: 'monospace',
                cursor: 'pointer',
                fontWeight: qualityMode === 'auto' ? 'bold' : 'normal',
              }}
            >
              Auto
            </button>
            <button
              onClick={() => setQualityMode('manual')}
              style={{
                background: qualityMode === 'manual' ? '#fbbf24' : 'rgba(255,255,255,0.06)',
                border: `1px solid ${qualityMode === 'manual' ? '#fbbf24' : 'rgba(255,255,255,0.2)'}`,
                color: 'white',
                padding: '4px 12px',
                borderRadius: 6,
                fontSize: 11,
                fontFamily: 'monospace',
                cursor: 'pointer',
                fontWeight: qualityMode === 'manual' ? 'bold' : 'normal',
              }}
            >
              Manual
            </button>
          </div>
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
            {testing ? 'Measuring...' : 'Run Performance Test'}
          </button>
          <div style={{ fontSize: 10, opacity: 0.4, marginTop: 4 }}>
            Measures FPS over 3 seconds and adjusts quality automatically.
          </div>
        </div>

        <div style={{ fontSize: 13, fontWeight: 'bold', marginBottom: 8, opacity: 0.6, marginTop: 8 }}>
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

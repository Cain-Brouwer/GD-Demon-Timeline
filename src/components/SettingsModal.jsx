import { useState, useEffect } from 'react'
import { useTimelineStore } from '../store/timelineStore'
import { LEVELS, getLevelAtIndex } from '../lib/qualityConfig'

const SETTINGS = [
  { key: 'starfield', label: 'Starfield', desc: 'Twinkelende sterren achtergrond' },
  { key: 'nebula', label: 'Nebula Clouds', desc: 'Nevelachtige wolken partikels', hasSlider: 'nebulaIntensity', sliderLabel: 'Intensity', sliderMin: 0, sliderMax: 2, sliderStep: 0.1 },
  { key: 'floatingParticles', label: 'Floating Particles', desc: 'Zwevende licht partikels' },
  { key: 'shootingStars', label: 'Shooting Stars', desc: 'Vallende sterren' },
  { key: 'blackHole', label: 'Black Hole (TON 618)', desc: 'Zwart gat model aan het einde' },
  { key: 'demonLabels', label: 'Demon Name Labels', desc: 'Naam labels boven elke demon' },
  { key: 'demonRings', label: 'Demon Rings', desc: 'Draaiende ringen om demonen' },
  { key: 'demonGlow', label: 'Demon Glow', desc: 'Glow effect achter demon iconen' },
]

function useMedia(query) {
  const [matches, setMatches] = useState(window.matchMedia(query).matches)
  useEffect(() => {
    const mq = window.matchMedia(query)
    const handler = (e) => setMatches(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [query])
  return matches
}

function SettingsModal({ onClose }) {
  const renderSettings = useTimelineStore((s) => s.renderSettings)
  const setRenderSetting = useTimelineStore((s) => s.setRenderSetting)
  const bloomEnabled = useTimelineStore((s) => s.bloomEnabled)
  const setBloomEnabled = useTimelineStore((s) => s.setBloomEnabled)
  const qualityLevelIndex = useTimelineStore((s) => s.qualityLevelIndex)
  const setQualityLevelIndex = useTimelineStore((s) => s.setQualityLevelIndex)
  const qualityMode = useTimelineStore((s) => s.qualityMode)
  const setQualityMode = useTimelineStore((s) => s.setQualityMode)
  const runPerformanceTest = useTimelineStore((s) => s.runPerformanceTest)
  const [testing, setTesting] = useState(false)
  const isMobile = useMedia('(max-width: 768px)')

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
          padding: isMobile ? 16 : 24,
          width: 'min(440px, 92vw)',
          maxHeight: '85vh',
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: isMobile ? 15 : 16, fontWeight: 'bold' }}>
            ⚙️ Settings
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)',
              fontSize: 18, cursor: 'pointer', width: 36, height: 36,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: 6,
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ marginBottom: 16, padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: isMobile ? 12 : 13, marginBottom: 8 }}>Quality Level</div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {LEVELS.map((level, idx) => (
              <button
                key={level}
                onClick={() => setQualityLevelIndex(idx)}
                style={{
                  flex: isMobile ? '1 1 calc(20% - 4px)' : 1,
                  minWidth: isMobile ? 0 : 0,
                  background: qualityLevelIndex === idx ? '#c084fc' : 'rgba(255,255,255,0.06)',
                  border: `1px solid ${qualityLevelIndex === idx ? '#c084fc' : 'rgba(255,255,255,0.2)'}`,
                  color: qualityLevelIndex === idx ? '#0a0015' : 'white',
                  padding: isMobile ? '10px 4px' : '6px 6px',
                  borderRadius: 6,
                  fontSize: isMobile ? 10 : 10,
                  fontFamily: 'monospace',
                  cursor: 'pointer',
                  fontWeight: qualityLevelIndex === idx ? 'bold' : 'normal',
                  transition: 'all 0.15s',
                }}
              >
                {getLevelAtIndex(idx).label}
              </button>
            ))}
          </div>
          <div style={{ fontSize: isMobile ? 10 : 10, opacity: 0.4, marginTop: 6 }}>
            Current: <span style={{ color: '#c084fc' }}>{currentLevel.label}</span>
            {' | '}Mode: <span style={{ color: qualityMode === 'auto' ? '#4ade80' : '#fbbf24' }}>{qualityMode === 'auto' ? 'Auto' : 'Manual'}</span>
          </div>
        </div>

        <div style={{ marginBottom: 16, padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: isMobile ? 12 : 13 }}>Mode</span>
            <button
              onClick={() => setQualityMode('auto')}
              style={{
                background: qualityMode === 'auto' ? '#4ade80' : 'rgba(255,255,255,0.06)',
                border: `1px solid ${qualityMode === 'auto' ? '#4ade80' : 'rgba(255,255,255,0.2)'}`,
                color: qualityMode === 'auto' ? '#0a0015' : 'white',
                padding: isMobile ? '8px 16px' : '4px 12px',
                borderRadius: 6,
                fontSize: isMobile ? 12 : 11,
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
                color: qualityMode === 'manual' ? '#0a0015' : 'white',
                padding: isMobile ? '8px 16px' : '4px 12px',
                borderRadius: 6,
                fontSize: isMobile ? 12 : 11,
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
              width: '100%',
              background: testing ? 'rgba(192,132,252,0.2)' : 'rgba(192,132,252,0.15)',
              border: '1px solid #c084fc',
              color: 'white',
              padding: isMobile ? '12px' : '6px 16px',
              borderRadius: 6,
              fontSize: isMobile ? 13 : 11,
              fontFamily: 'monospace',
              cursor: testing ? 'default' : 'pointer',
              opacity: testing ? 0.5 : 1,
            }}
          >
            {testing ? 'Measuring...' : 'Run Performance Test'}
          </button>
          <div style={{ fontSize: isMobile ? 10 : 10, opacity: 0.4, marginTop: 4 }}>
            Measures FPS over 3 seconds and adjusts quality automatically.
          </div>
        </div>

        <div style={{ fontSize: isMobile ? 12 : 13, fontWeight: 'bold', marginBottom: 8, opacity: 0.6, marginTop: 8 }}>
          Render Toggles
        </div>

        {SETTINGS.map(({ key, label, desc, hasSlider, sliderLabel, sliderMin, sliderMax, sliderStep }) => (
          <div key={key} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <label
              style={{
                display: 'flex', alignItems: 'center', gap: isMobile ? 10 : 12,
                padding: isMobile ? '10px 0' : '8px 0',
                cursor: 'pointer',
                minHeight: isMobile ? 44 : 'auto',
              }}
            >
              <input
                type="checkbox"
                checked={renderSettings[key]}
                onChange={() => setRenderSetting(key, !renderSettings[key])}
                style={{ accentColor: '#c084fc', width: isMobile ? 20 : 16, height: isMobile ? 20 : 16, flexShrink: 0 }}
              />
              <div>
                <div style={{ fontSize: isMobile ? 13 : 13 }}>{label}</div>
                <div style={{ fontSize: isMobile ? 10 : 10, opacity: 0.4, marginTop: 2 }}>{desc}</div>
              </div>
            </label>
            {hasSlider && renderSettings[key] && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 0 8px 32px' }}>
                <span style={{ fontSize: 10, opacity: 0.4, minWidth: 40 }}>{sliderLabel}</span>
                <input
                  type="range"
                  min={sliderMin}
                  max={sliderMax}
                  step={sliderStep}
                  value={renderSettings[hasSlider] ?? 1}
                  onChange={(e) => setRenderSetting(hasSlider, parseFloat(e.target.value))}
                  style={{ flex: 1, accentColor: '#c084fc', height: 4 }}
                />
                <span style={{ fontSize: 10, opacity: 0.6, minWidth: 24, textAlign: 'right', fontFamily: 'monospace' }}>
                  {(renderSettings[hasSlider] ?? 1).toFixed(1)}
                </span>
              </div>
            )}
          </div>
        ))}
        <label
          style={{
            display: 'flex', alignItems: 'center', gap: isMobile ? 10 : 12,
            padding: isMobile ? '10px 0' : '8px 0',
            cursor: 'pointer',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            minHeight: isMobile ? 44 : 'auto',
          }}
        >
          <input
            type="checkbox"
            checked={bloomEnabled}
            onChange={() => setBloomEnabled(!bloomEnabled)}
            style={{ accentColor: '#c084fc', width: isMobile ? 20 : 16, height: isMobile ? 20 : 16, flexShrink: 0 }}
          />
          <div>
            <div style={{ fontSize: isMobile ? 13 : 13 }}>Bloom</div>
            <div style={{ fontSize: isMobile ? 10 : 10, opacity: 0.4, marginTop: 2 }}>Bloom post-processing glow — resource intensive on desktop GPUs</div>
          </div>
        </label>

        <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              width: isMobile ? '100%' : 'auto',
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: 'white',
              padding: isMobile ? '12px' : '6px 16px',
              borderRadius: 6,
              fontSize: isMobile ? 14 : 12,
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
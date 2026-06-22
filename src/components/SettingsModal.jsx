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
          ⚙️ Render Settings
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

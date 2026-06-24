import { useState } from 'react'
import { useTimelineStore } from '../store/timelineStore'

function DeviceWarning({ onClose }) {
  const runPerformanceTest = useTimelineStore((s) => s.runPerformanceTest)
  const setPerformanceTested = useTimelineStore((s) => s.setPerformanceTested)
  const [testing, setTesting] = useState(false)
  const [result, setResult] = useState(null)

  const handleTest = async () => {
    setTesting(true)
    const mode = await runPerformanceTest()
    setResult(mode)
    setTesting(false)
  }

  const handleSkip = () => {
    setPerformanceTested(true)
    onClose()
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 10002,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.8)',
        fontFamily: 'monospace', color: 'white',
      }}
    >
      <div
        style={{
          background: '#1a0a2e',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: 12,
          padding: '28px 32px',
          maxWidth: 460,
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 28, marginBottom: 12 }}>⚠️</div>
        <div style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 12 }}>
          Performance Warning
        </div>
        <p style={{ fontSize: 12, opacity: 0.7, lineHeight: 1.6, margin: 0 }}>
          This application uses intensive 3D graphics and may not run smoothly on
          all devices. For the best experience, we recommend running an automatic
          performance test to optimize the visual settings for your device.
        </p>

        {testing && (
          <div style={{ marginTop: 16, fontSize: 12, color: '#c084fc' }}>
            Measuring performance...
          </div>
        )}

        {result && (
          <div style={{ marginTop: 16, fontSize: 12 }}>
            {result === 'normal'
              ? '✅ Your device can handle normal quality settings.'
              : <span style={{ color: '#fbbf24' }}>⚠️ Low quality mode recommended for smooth performance.</span>}
          </div>
        )}

        <div style={{ marginTop: 20, display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button
            onClick={handleTest}
            disabled={testing}
            style={{
              background: result ? 'rgba(192,132,252,0.3)' : '#c084fc',
              border: '1px solid #c084fc',
              color: 'white',
              padding: '8px 20px',
              borderRadius: 6,
              fontSize: 13,
              fontFamily: 'monospace',
              cursor: testing ? 'default' : 'pointer',
              opacity: testing ? 0.5 : 1,
              fontWeight: 'bold',
            }}
          >
            {testing ? 'Testing...' : result ? 'Retry Test' : 'Run Performance Test'}
          </button>
          <button
            onClick={handleSkip}
            disabled={testing}
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: 'white',
              padding: '8px 20px',
              borderRadius: 6,
              fontSize: 13,
              fontFamily: 'monospace',
              cursor: testing ? 'default' : 'pointer',
              opacity: testing ? 0.5 : 1,
            }}
          >
            {result ? 'Done' : 'Skip'}
          </button>
        </div>

        {result && (
          <div style={{ marginTop: 12 }}>
            <button
              onClick={handleSkip}
              style={{
                background: 'none',
                border: 'none',
                color: 'rgba(255,255,255,0.4)',
                fontSize: 12,
                fontFamily: 'monospace',
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              Continue
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default DeviceWarning

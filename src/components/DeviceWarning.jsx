import { useState, useEffect } from 'react'
import { useTimelineStore } from '../store/timelineStore'
import { LEVELS, getLevelAtIndex } from '../lib/qualityConfig'
import { detectDevice } from '../lib/detectDevice'

function DeviceWarning({ onClose }) {
  const runPerformanceTest = useTimelineStore((s) => s.runPerformanceTest)
  const setPerformanceTested = useTimelineStore((s) => s.setPerformanceTested)
  const setQualityLevelIndex = useTimelineStore((s) => s.setQualityLevelIndex)
  const [testing, setTesting] = useState(false)
  const [result, setResult] = useState(null)
  const [deviceInfo, setDeviceInfo] = useState(null)

  useEffect(() => {
    detectDevice().then(setDeviceInfo)
  }, [])

  const handleTest = async () => {
    setTesting(true)
    const mode = await runPerformanceTest()
    setResult(mode)
    setTesting(false)
  }

  const handleSkip = () => {
    if (!result && deviceInfo && deviceInfo.recommendedLevel != null) {
      setQualityLevelIndex(deviceInfo.recommendedLevel)
    }
    setPerformanceTested(true)
    onClose()
  }

  const resultIdx = result != null ? LEVELS.indexOf(result) : -1
  const resultLabel = resultIdx >= 0 ? getLevelAtIndex(resultIdx).label : null
  const isGood = resultIdx >= 3

  const recLabel = deviceInfo ? getLevelAtIndex(deviceInfo.recommendedLevel).label : null

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

        {deviceInfo && !result && (
          <div style={{ marginTop: 12, fontSize: 11, opacity: 0.5 }}>
            Detected device: {deviceInfo.isMobile ? 'Mobile' : 'Desktop'}
            {deviceInfo.gpu && ` · ${deviceInfo.gpu.renderer.slice(0, 30)}`}
            {deviceInfo.memory && ` · ${deviceInfo.memory}GB RAM`}
            <div style={{ marginTop: 4 }}>
              Recommended: <span style={{ color: '#c084fc' }}>{recLabel}</span>
            </div>
          </div>
        )}

        {testing && (
          <div style={{ marginTop: 16, fontSize: 12, color: '#c084fc' }}>
            Measuring performance...
          </div>
        )}

        {result && (
          <div style={{ marginTop: 16, fontSize: 12 }}>
            {isGood
              ? `✅ Your device can handle ${resultLabel} quality settings.`
              : <span style={{ color: '#fbbf24' }}>⚠️ {resultLabel} quality mode recommended for smooth performance.</span>}
            <div style={{ fontSize: 11, opacity: 0.5, marginTop: 8 }}>
              Quality levels: Potato (minimal) → Low → Medium → High → Ultra (maximum).
              The test selected <strong>{resultLabel}</strong> for your device.
            </div>
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

      </div>
    </div>
  )
}

export default DeviceWarning

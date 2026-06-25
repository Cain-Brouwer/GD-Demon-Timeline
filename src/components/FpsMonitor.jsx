import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useTimelineStore } from '../store/timelineStore'

const LOW_FPS_THRESHOLD = 30
const HIGH_FPS_THRESHOLD = 55
const LOW_DURATION_MS = 2000
const HIGH_DURATION_MS = 5000
const CRITICAL_FPS = 15
const SANE_MAX_DELTA = 0.1

function FpsMonitor() {
  const qualityLevelIndex = useTimelineStore((s) => s.qualityLevelIndex)
  const setQualityLevelIndex = useTimelineStore((s) => s.setQualityLevelIndex)
  const qualityMode = useTimelineStore((s) => s.qualityMode)
  const performanceTested = useTimelineStore((s) => s.performanceTested)
  const sceneTransitioning = useTimelineStore((s) => s.sceneTransitioning)

  const samples = useRef([])
  const lowStart = useRef(null)
  const highStart = useRef(null)
  const initialLevel = useRef(qualityLevelIndex)

  useFrame((_, delta) => {
    if (qualityMode !== 'auto' || !performanceTested) return
    if (sceneTransitioning) return
    if (delta > SANE_MAX_DELTA) return

    const now = performance.now()
    const fps = delta > 0 ? 1 / delta : 60

    samples.current.push({ fps, time: now })
    if (samples.current.length > 60) samples.current.shift()

    if (fps > 0 && fps < CRITICAL_FPS) {
      const idx = Math.max(0, qualityLevelIndex - 1)
      if (idx < qualityLevelIndex) {
        setQualityLevelIndex(idx)
      }
      lowStart.current = null
      highStart.current = null
      return
    }

    const recent = samples.current.slice(-15)
    const avgFps = recent.reduce((s, v) => s + v.fps, 0) / recent.length

    if (avgFps < LOW_FPS_THRESHOLD) {
      if (lowStart.current === null) lowStart.current = now
      if (now - lowStart.current >= LOW_DURATION_MS) {
        const idx = Math.max(0, qualityLevelIndex - 1)
        if (idx < qualityLevelIndex) {
          setQualityLevelIndex(idx)
        }
        lowStart.current = null
        highStart.current = null
      }
    } else {
      lowStart.current = null
    }

    if (avgFps > HIGH_FPS_THRESHOLD) {
      if (highStart.current === null) highStart.current = now
      if (now - highStart.current >= HIGH_DURATION_MS) {
        const maxAllowed = initialLevel.current
        const idx = Math.min(maxAllowed, qualityLevelIndex + 1)
        if (idx > qualityLevelIndex) {
          setQualityLevelIndex(idx)
        }
        highStart.current = null
        lowStart.current = null
      }
    } else {
      highStart.current = null
    }
  })

  return null
}

export default FpsMonitor

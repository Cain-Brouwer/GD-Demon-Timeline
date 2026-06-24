import { useEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import { useTimelineStore } from '../store/timelineStore'
import { startCollector, stopCollector, takeSnapshot } from '../lib/renderDebug'

function RenderDebugger() {
  const { gl, camera, scene } = useThree()

  useEffect(() => {
    // FPS counter for snapshots
    let frameCount = 0
    let lastTime = performance.now()
    const fpsInterval = setInterval(() => {
      const now = performance.now()
      const delta = now - lastTime
      window.__renderDebugFps = delta > 0 ? (frameCount / delta) * 1000 : 60
      frameCount = 0
      lastTime = now
    }, 1000)

    const getState = () => useTimelineStore.getState()

    // Take an immediate first snapshot
    setTimeout(() => {
      const st = useTimelineStore.getState()
      takeSnapshot(camera, gl, st.demons, st.renderSettings, scene)
      console.log('[renderDebug] Active — Ctrl+Shift+D to download dump')
    }, 1500)

    startCollector(getState, gl, camera, scene)

    // Track frames per second
    const animLoop = () => {
      frameCount++
      requestAnimationFrame(animLoop)
    }
    const raf = requestAnimationFrame(animLoop)

    return () => {
      stopCollector()
      clearInterval(fpsInterval)
      cancelAnimationFrame(raf)
    }
  }, [gl, camera, scene])

  return null
}

export default RenderDebugger

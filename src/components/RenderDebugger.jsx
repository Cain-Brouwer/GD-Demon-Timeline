import { useEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import { useTimelineStore } from '../store/timelineStore'
import { startCollector, stopCollector, takeSnapshot } from '../lib/renderDebug'

function RenderDebugger() {
  const { gl, camera, scene } = useThree()

  console.log('[RD] mounted', { hasGl: !!gl, hasCam: !!camera, hasScene: !!scene })

  useEffect(() => {
    console.log('[RD] effect running', { hasGl: !!gl, hasCam: !!camera, hasScene: !!scene })
    if (!gl || !camera || !scene) {
      console.warn('[RD] cannot start — missing three objects')
      return
    }

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

    setTimeout(() => {
      const st = useTimelineStore.getState()
      console.log('[RD] first snapshot attempt', { demonCount: st.demons?.length })
      takeSnapshot(camera, gl, st.demons, st.renderSettings, scene)
      console.log('[renderDebug] Active — Ctrl+Shift+D to download dump')
    }, 1500)

    console.log('[RD] starting collector')
    startCollector(getState, gl, camera, scene)

    const animLoop = () => {
      frameCount++
      requestAnimationFrame(animLoop)
    }
    const raf = requestAnimationFrame(animLoop)

    return () => {
      console.log('[RD] cleanup')
      stopCollector()
      clearInterval(fpsInterval)
      cancelAnimationFrame(raf)
    }
  }, [gl, camera, scene])

  return null
}

export default RenderDebugger

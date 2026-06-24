import { useEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import { useTimelineStore } from '../store/timelineStore'
import { startCollector, stopCollector, takeSnapshot } from '../lib/renderDebug'

function RenderDebugger() {
  const { gl, camera, scene } = useThree()
  const enabledRef = useRef(typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('debug'))

  useEffect(() => {
    if (!enabledRef.current) return
    if (!gl || !camera || !scene) {
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
      takeSnapshot(camera, gl, st.demons, st.renderSettings, scene)
    }, 1500)

    startCollector(getState, gl, camera, scene)

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

  if (!enabledRef.current) return null
  return null
}

export default RenderDebugger

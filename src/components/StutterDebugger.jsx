import { useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { record } from '../lib/stutterDebug'
import { perf } from '../lib/perfDebug'

function StutterDebugger() {
  const { gl, camera } = useThree()

  useEffect(() => {
    perf.logWebGLInfo(gl)
  }, [gl])

  useFrame((_, delta) => {
    try {
      record(delta, gl, camera)
      perf.detectStutter(delta * 1000)
    } catch (e) { console.warn('[StutterDebugger]', e) }
  })

  return null
}

export default StutterDebugger

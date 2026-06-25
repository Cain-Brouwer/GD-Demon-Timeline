import { useRef, useMemo, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

const DIFFICULTY_COLORS = {
  'Easy Demon': '#00ff00',
  'Medium Demon': '#ffff00',
  'Hard Demon': '#ff6600',
  'Insane Demon': '#ff0000',
  'Extreme Demon': '#ff00ff',
}

const tempVec3 = new THREE.Vector3()
const tempQuat = new THREE.Quaternion()
const tempEuler = new THREE.Euler()
const tempMatrix = new THREE.Matrix4()
const tempColor = new THREE.Color()

function InstancedRings({ demons, ringSegments }) {
  const meshRef = useRef()
  const { camera } = useThree()
  const count = demons.length

  const geometry = useMemo(
    () => new THREE.TorusGeometry(1.4, 0.04, ringSegments, Math.max(8, Math.round(ringSegments / 2))),
    [ringSegments]
  )
  const material = useMemo(
    () => new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false }),
    []
  )

  useEffect(() => {
    return () => geometry.dispose()
  }, [geometry])

  useFrame((state) => {
    const mesh = meshRef.current
    if (!mesh || count === 0) return
    const t = state.clock.getElapsedTime()

    let sumX = 0
    for (let i = 0; i < count; i++) sumX += demons[i]?.position[0] || 0
    const centerX = sumX / count
    tempVec3.set(centerX, 0, 0)
    const dist = camera.position.distanceTo(tempVec3)
    mesh.renderOrder = Math.round(-dist * 50) * 10000 + 4

    for (let i = 0; i < count; i++) {
      const demon = demons[i]
      if (!demon) continue
      const [x, , z] = demon.position
      const isFuture = demon.progress === 0
      const diffColor = DIFFICULTY_COLORS[demon.difficulty] || '#ffffff'

      tempVec3.set(x, 0, z)
      const dist = camera.position.distanceTo(tempVec3)

      const screenScale = Math.max(0.3, dist / 50)
      const s = dist < 120 ? 0.5 * screenScale : 0.001
      const rotZ = t * 0.008 + i * 0.1
      const rotX = 0.4 + Math.sin(t * 0.3 + x) * 0.1

      tempEuler.set(rotX, 0, rotZ)
      tempQuat.setFromEuler(tempEuler)
      tempMatrix.compose(tempVec3, tempQuat, new THREE.Vector3(s, s, s))
      mesh.setMatrixAt(i, tempMatrix)

      const opacity = isFuture ? 0.15 : 0.25
      tempColor.set(diffColor)
      tempColor.multiplyScalar(isFuture ? 0.4 : 1)
      mesh.setColorAt(i, tempColor)
    }

    mesh.instanceMatrix.needsUpdate = true
    mesh.instanceColor.needsUpdate = true
  })

  if (count === 0) return null

  return <instancedMesh ref={meshRef} args={[geometry, material, count]} frustumCulled={false} />
}

export default InstancedRings

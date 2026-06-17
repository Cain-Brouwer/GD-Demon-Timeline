import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function TimelineLines({ demons }) {
  const particleRef = useRef()
  const positionsRef = useRef(null)

  const curve = useMemo(() => {
    if (demons.length < 2) return null
    const pts = demons.map((d) => new THREE.Vector3(d.position[0], d.position[1] || 0, d.position[2] || 0))
    return new THREE.CatmullRomCurve3(pts)
  }, [demons])

  const tubeGeo = useMemo(() => {
    if (!curve) return null
    return new THREE.TubeGeometry(curve, 80, 0.12, 6, false)
  }, [curve])

  const glowGeo = useMemo(() => {
    if (!curve) return null
    return new THREE.TubeGeometry(curve, 80, 0.5, 8, false)
  }, [curve])

  const particleCount = 60
  const initialPositions = useMemo(() => {
    if (!curve) return null
    const arr = new Float32Array(particleCount * 3)
    for (let i = 0; i < particleCount; i++) {
      const t = i / particleCount
      const pt = curve.getPoint(t)
      arr[i * 3] = pt.x
      arr[i * 3 + 1] = pt.y
      arr[i * 3 + 2] = pt.z
    }
    positionsRef.current = arr
    return arr
  }, [curve])

  useFrame((state) => {
    if (!particleRef.current || !curve) return
    const time = state.clock.getElapsedTime() * 0.25
    const pos = particleRef.current.geometry.attributes.position.array
    for (let i = 0; i < particleCount; i++) {
      const t = ((i / particleCount) + time) % 1
      const pt = curve.getPoint(t)
      pos[i * 3] = pt.x
      pos[i * 3 + 1] = pt.y
      pos[i * 3 + 2] = pt.z
    }
    particleRef.current.geometry.attributes.position.needsUpdate = true
  })

  if (!curve || demons.length < 2) return null

  return (
    <group>
      <mesh geometry={glowGeo}>
        <meshBasicMaterial color="#c084fc" transparent opacity={0.08} depthWrite={false} />
      </mesh>
      <mesh geometry={tubeGeo}>
        <meshBasicMaterial color="#c084fc" transparent opacity={0.35} depthWrite={false} />
      </mesh>
      <mesh geometry={tubeGeo}>
        <meshBasicMaterial color="white" transparent opacity={0.15} depthWrite={false} />
      </mesh>
      <points ref={particleRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particleCount}
            array={initialPositions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial size={0.8} color="white" transparent opacity={0.9} sizeAttenuation depthWrite={false} />
      </points>
    </group>
  )
}

export default TimelineLines
